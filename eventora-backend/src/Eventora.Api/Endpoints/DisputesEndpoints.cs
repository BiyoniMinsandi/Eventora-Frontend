using System.Security.Claims;
using Eventora.Application.Abstractions.Persistence;
using Eventora.Application.Contracts.Disputes;
using Eventora.Domain.Bookings;
using Eventora.Domain.Disputes;
using Eventora.Domain.Notifications;

namespace Eventora.Api.Endpoints;

internal static class DisputesEndpoints
{
    public static void MapDisputesEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/disputes").WithTags("Disputes").RequireAuthorization();

        group.MapGet("", async (
            ClaimsPrincipal principal,
            IUserRepository users,
            IDisputeRepository disputes,
            CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();

            var user = await users.GetByIdAsync(userId, ct);
            if (user is null) return Results.Unauthorized();

            IReadOnlyList<Dispute> list = user.Role switch
            {
                Eventora.Domain.Users.UserRole.Admin => await disputes.GetAllAsync(ct),
                Eventora.Domain.Users.UserRole.Vendor => await disputes.GetForVendorAsync(userId, ct),
                _ => await disputes.GetForCustomerAsync(userId, ct)
            };

            return Results.Ok(list.Select(DisputeDtoMapping.ToDto));
        });

        group.MapGet("/{id}", async (
            string id,
            ClaimsPrincipal principal,
            IDisputeRepository disputes,
            CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();

            var dispute = await disputes.GetByIdAsync(id, ct);
            if (dispute is null) return Results.NotFound(new { message = "Dispute not found" });

            var isParticipant = dispute.CustomerId == userId || dispute.VendorId == userId;
            if (!isParticipant && !principal.IsInRole("admin")) return Results.Forbid();

            return Results.Ok(DisputeDtoMapping.ToDto(dispute));
        });

        group.MapPost("", async (
            CreateDisputeRequest req,
            ClaimsPrincipal principal,
            IUserRepository users,
            IBookingRepository bookings,
            IDisputeRepository disputes,
            INotificationRepository notifications,
            CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();
            if (!principal.IsInRole("customer")) return Results.Forbid();

            var customer = await users.GetByIdAsync(userId, ct);
            if (customer is null) return Results.Unauthorized();

            var booking = await bookings.GetByIdAsync(req.BookingId, ct);
            if (booking is null) return Results.NotFound(new { message = "Booking not found" });
            if (booking.CustomerId != userId) return Results.Forbid();

            var existing = await disputes.GetByBookingIdAsync(req.BookingId, ct);
            if (existing is not null && (existing.Status == DisputeStatus.Open || existing.Status == DisputeStatus.InReview))
            {
                return Results.Conflict(new { message = "A dispute already exists for this booking" });
            }

            if (!TryParseCategory(req.Category, out var category))
            {
                return Results.BadRequest(new { message = "Invalid dispute category" });
            }

            var dispute = new Dispute
            {
                BookingId = booking.Id,
                CustomerId = customer.Id,
                CustomerName = customer.FullName,
                VendorId = booking.VendorId,
                VendorName = booking.VendorBusinessName,
                Title = req.Title.Trim(),
                Description = req.Description.Trim(),
                Category = category,
                Evidence = req.Evidence ?? [],
                Status = DisputeStatus.Open,
                Priority = DisputePriority.Medium,
            };

            await disputes.CreateAsync(dispute, ct);

            await NotificationHelpers.CreateAsync(
                notifications,
                booking.VendorId,
                NotificationType.DisputeUpdate,
                "New dispute raised",
                $"A customer opened a dispute for booking {booking.Id}.",
                relatedBookingId: booking.Id,
                relatedDisputeId: dispute.Id,
                ct);

            return Results.Ok(DisputeDtoMapping.ToDto(dispute));
        }).RequireAuthorization("CustomerOnly");

        // Admin updates
        var admin = app.MapGroup("/api/admin/disputes").WithTags("Admin").RequireAuthorization("AdminOnly");

        admin.MapPatch("/{id}", async (
            string id,
            UpdateDisputeRequest req,
            IDisputeRepository disputes,
            INotificationRepository notifications,
            CancellationToken ct) =>
        {
            var dispute = await disputes.GetByIdAsync(id, ct);
            if (dispute is null) return Results.NotFound(new { message = "Dispute not found" });

            if (!string.IsNullOrWhiteSpace(req.Status) && TryParseStatus(req.Status, out var status))
            {
                dispute.Status = status;
            }

            if (!string.IsNullOrWhiteSpace(req.Priority) && TryParsePriority(req.Priority, out var priority))
            {
                dispute.Priority = priority;
            }

            if (req.Resolution is not null)
            {
                dispute.Resolution = string.IsNullOrWhiteSpace(req.Resolution) ? null : req.Resolution.Trim();
            }

            await disputes.UpdateAsync(dispute, ct);

            await NotificationHelpers.CreateAsync(
                notifications,
                dispute.CustomerId,
                NotificationType.DisputeUpdate,
                "Dispute updated",
                $"Your dispute {dispute.Id} was updated by an admin.",
                relatedBookingId: dispute.BookingId,
                relatedDisputeId: dispute.Id,
                ct);

            await NotificationHelpers.CreateAsync(
                notifications,
                dispute.VendorId,
                NotificationType.DisputeUpdate,
                "Dispute updated",
                $"Dispute {dispute.Id} was updated by an admin.",
                relatedBookingId: dispute.BookingId,
                relatedDisputeId: dispute.Id,
                ct);

            return Results.Ok(DisputeDtoMapping.ToDto(dispute));
        });
    }

    private static bool TryParseCategory(string value, out DisputeCategory category)
    {
        category = DisputeCategory.Other;
        var v = (value ?? string.Empty).Trim().ToLowerInvariant();
        return v switch
        {
            "quality" => (category = DisputeCategory.Quality) == DisputeCategory.Quality,
            "behavior" => (category = DisputeCategory.Behavior) == DisputeCategory.Behavior,
            "payment" => (category = DisputeCategory.Payment) == DisputeCategory.Payment,
            "schedule" => (category = DisputeCategory.Schedule) == DisputeCategory.Schedule,
            "damage" => (category = DisputeCategory.Damage) == DisputeCategory.Damage,
            "other" => (category = DisputeCategory.Other) == DisputeCategory.Other,
            _ => false,
        };
    }

    private static bool TryParseStatus(string value, out DisputeStatus status)
    {
        status = DisputeStatus.Open;
        var v = (value ?? string.Empty).Trim().ToLowerInvariant().Replace("_", "-");
        return v switch
        {
            "open" => (status = DisputeStatus.Open) == DisputeStatus.Open,
            "in-review" => (status = DisputeStatus.InReview) == DisputeStatus.InReview,
            "resolved" => (status = DisputeStatus.Resolved) == DisputeStatus.Resolved,
            "closed" => (status = DisputeStatus.Closed) == DisputeStatus.Closed,
            _ => false,
        };
    }

    private static bool TryParsePriority(string value, out DisputePriority priority)
    {
        priority = DisputePriority.Medium;
        var v = (value ?? string.Empty).Trim().ToLowerInvariant();
        return v switch
        {
            "low" => (priority = DisputePriority.Low) == DisputePriority.Low,
            "medium" => (priority = DisputePriority.Medium) == DisputePriority.Medium,
            "high" => (priority = DisputePriority.High) == DisputePriority.High,
            _ => false,
        };
    }
}
