using System.Security.Claims;
using Eventora.Application.Abstractions.Persistence;
using Eventora.Application.Contracts.Bookings;
using Eventora.Domain.Bookings;
using Eventora.Domain.Notifications;
using Eventora.Domain.Users;

namespace Eventora.Api.Endpoints;

internal static class BookingsEndpoints
{
    public static void MapBookingEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/bookings").WithTags("Bookings").RequireAuthorization();

        group.MapGet("", async (
            ClaimsPrincipal principal,
            IUserRepository users,
            IBookingRepository bookings,
            CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();

            var user = await users.GetByIdAsync(userId, ct);
            if (user is null) return Results.Unauthorized();

            IReadOnlyList<Eventora.Domain.Bookings.Booking> result = user.Role switch
            {
                UserRole.Customer => await bookings.GetForCustomerAsync(userId, ct),
                UserRole.Vendor => await bookings.GetForVendorAsync(userId, ct),
                _ => await bookings.GetForCustomerAsync(userId, ct)
            };

            return Results.Ok(result.Select(BookingDtoMapping.ToDto));
        });

        group.MapGet("/{id}", async (
            string id,
            ClaimsPrincipal principal,
            IUserRepository users,
            IBookingRepository bookings,
            CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();

            var booking = await bookings.GetByIdAsync(id, ct);
            if (booking is null) return Results.NotFound(new { message = "Booking not found" });

            var isParticipant = booking.CustomerId == userId || booking.VendorId == userId;
            if (!isParticipant && !principal.IsInRole("admin")) return Results.Forbid();

            return Results.Ok(BookingDtoMapping.ToDto(booking));
        });

        group.MapPost("", async (
            CreateBookingRequest req,
            ClaimsPrincipal principal,
            IUserRepository users,
            IBookingRepository bookings,
            INotificationRepository notifications,
            CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();
            if (!principal.IsInRole("customer")) return Results.Forbid();

            var customer = await users.GetByIdAsync(userId, ct);
            if (customer is null) return Results.Unauthorized();

            var vendor = await users.GetByIdAsync(req.VendorId, ct);
            if (vendor is null || vendor.Role != UserRole.Vendor || !vendor.Approved)
            {
                return Results.BadRequest(new { message = "Vendor is not available" });
            }

            var booking = new Eventora.Domain.Bookings.Booking
            {
                CustomerId = customer.Id,
                CustomerName = customer.FullName,
                VendorId = vendor.Id,
                VendorName = vendor.FullName,
                VendorBusinessName = vendor.BusinessName ?? vendor.FullName,
                Service = req.Service.Trim(),
                EventDate = req.EventDate.Trim(),
                EventType = req.EventType.Trim(),
                GuestCount = req.GuestCount,
                Budget = string.IsNullOrWhiteSpace(req.Budget) ? null : req.Budget.Trim(),
                SpecialRequests = string.IsNullOrWhiteSpace(req.SpecialRequests) ? null : req.SpecialRequests.Trim(),
                Status = BookingStatus.Pending,
            };

            await bookings.CreateAsync(booking, ct);

            await NotificationHelpers.CreateAsync(
                notifications,
                vendor.Id,
                NotificationType.BookingRequest,
                "New booking request",
                $"You have a new booking request from {customer.FullName}.",
                relatedBookingId: booking.Id,
                relatedDisputeId: null,
                ct);

            return Results.Ok(BookingDtoMapping.ToDto(booking));
        }).RequireAuthorization("CustomerOnly");

        group.MapPost("/{id}/accept", async (
            string id,
            BookingDecisionRequest req,
            ClaimsPrincipal principal,
            IUserRepository users,
            IBookingRepository bookings,
            IConversationRepository conversations,
            INotificationRepository notifications,
            CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();
            if (!principal.IsInRole("vendor")) return Results.Forbid();

            var booking = await bookings.GetByIdAsync(id, ct);
            if (booking is null) return Results.NotFound(new { message = "Booking not found" });
            if (booking.VendorId != userId) return Results.Forbid();
            if (booking.Status != BookingStatus.Pending) return Results.BadRequest(new { message = "Booking is not pending" });

            booking.Status = BookingStatus.Accepted;
            booking.VendorResponseNote = string.IsNullOrWhiteSpace(req.VendorResponseNote) ? null : req.VendorResponseNote.Trim();
            await bookings.UpdateAsync(booking, ct);

            // Create a conversation on acceptance (frontend behavior)
            var existing = await conversations.GetByParticipantsAsync(booking.CustomerId, booking.VendorId, ct);
            if (existing is null)
            {
                var conversation = new Eventora.Domain.Messaging.Conversation
                {
                    CustomerId = booking.CustomerId,
                    CustomerName = booking.CustomerName,
                    VendorId = booking.VendorId,
                    VendorName = booking.VendorBusinessName,
                    LastMessage = "Booking accepted. You can start chatting.",
                    LastMessageTime = DateTimeOffset.UtcNow,
                };

                await conversations.CreateAsync(conversation, ct);
            }

            await NotificationHelpers.CreateAsync(
                notifications,
                booking.CustomerId,
                NotificationType.BookingAccepted,
                "Booking accepted",
                $"Your booking request was accepted by {booking.VendorBusinessName}.",
                relatedBookingId: booking.Id,
                relatedDisputeId: null,
                ct);

            return Results.Ok(BookingDtoMapping.ToDto(booking));
        }).RequireAuthorization("VendorOnly");

        group.MapPost("/{id}/reject", async (
            string id,
            BookingDecisionRequest req,
            ClaimsPrincipal principal,
            IBookingRepository bookings,
            INotificationRepository notifications,
            CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();
            if (!principal.IsInRole("vendor")) return Results.Forbid();

            var booking = await bookings.GetByIdAsync(id, ct);
            if (booking is null) return Results.NotFound(new { message = "Booking not found" });
            if (booking.VendorId != userId) return Results.Forbid();
            if (booking.Status != BookingStatus.Pending) return Results.BadRequest(new { message = "Booking is not pending" });

            booking.Status = BookingStatus.Rejected;
            booking.VendorResponseNote = string.IsNullOrWhiteSpace(req.VendorResponseNote) ? null : req.VendorResponseNote.Trim();
            await bookings.UpdateAsync(booking, ct);

            await NotificationHelpers.CreateAsync(
                notifications,
                booking.CustomerId,
                NotificationType.BookingRejected,
                "Booking rejected",
                $"Your booking request was rejected by {booking.VendorBusinessName}.",
                relatedBookingId: booking.Id,
                relatedDisputeId: null,
                ct);

            return Results.Ok(BookingDtoMapping.ToDto(booking));
        }).RequireAuthorization("VendorOnly");

        group.MapPost("/{id}/cancel", async (
            string id,
            ClaimsPrincipal principal,
            IBookingRepository bookings,
            INotificationRepository notifications,
            CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();
            if (!principal.IsInRole("customer")) return Results.Forbid();

            var booking = await bookings.GetByIdAsync(id, ct);
            if (booking is null) return Results.NotFound(new { message = "Booking not found" });
            if (booking.CustomerId != userId) return Results.Forbid();
            if (booking.Status is BookingStatus.Completed or BookingStatus.Cancelled) return Results.BadRequest(new { message = "Booking cannot be cancelled" });

            booking.Status = BookingStatus.Cancelled;
            await bookings.UpdateAsync(booking, ct);

            await NotificationHelpers.CreateAsync(
                notifications,
                booking.VendorId,
                NotificationType.BookingRejected,
                "Booking cancelled",
                $"A customer cancelled booking {booking.Id}.",
                relatedBookingId: booking.Id,
                relatedDisputeId: null,
                ct);

            return Results.Ok(BookingDtoMapping.ToDto(booking));
        }).RequireAuthorization("CustomerOnly");

        group.MapPost("/{id}/complete", async (
            string id,
            ClaimsPrincipal principal,
            IBookingRepository bookings,
            INotificationRepository notifications,
            CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();
            if (!principal.IsInRole("vendor")) return Results.Forbid();

            var booking = await bookings.GetByIdAsync(id, ct);
            if (booking is null) return Results.NotFound(new { message = "Booking not found" });
            if (booking.VendorId != userId) return Results.Forbid();
            if (booking.Status != BookingStatus.Accepted) return Results.BadRequest(new { message = "Booking must be accepted to complete" });

            booking.Status = BookingStatus.Completed;
            await bookings.UpdateAsync(booking, ct);

            await NotificationHelpers.CreateAsync(
                notifications,
                booking.CustomerId,
                NotificationType.BookingCompleted,
                "Booking completed",
                $"Your booking with {booking.VendorBusinessName} is marked as completed.",
                relatedBookingId: booking.Id,
                relatedDisputeId: null,
                ct);

            await NotificationHelpers.CreateAsync(
                notifications,
                booking.CustomerId,
                NotificationType.ReviewPrompt,
                "Leave a review",
                "Your event is complete. Please leave a review for your vendor.",
                relatedBookingId: booking.Id,
                relatedDisputeId: null,
                ct);

            return Results.Ok(BookingDtoMapping.ToDto(booking));
        }).RequireAuthorization("VendorOnly");
    }
}
