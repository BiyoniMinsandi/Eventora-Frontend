using System.Security.Claims;
using Eventora.Application.Abstractions.Persistence;
using Eventora.Application.Contracts.Messaging;
using Eventora.Domain.Bookings;
using Eventora.Domain.Notifications;

namespace Eventora.Api.Endpoints;

/// <summary>
/// Structured booking message endpoints (SRS §4.5).
/// Conversations are always linked to a specific booking; messaging is blocked
/// unless the booking is Accepted or Completed.
/// </summary>
internal static class MessagingEndpoints
{
    public static void MapMessagingEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/conversations").WithTags("Messaging").RequireAuthorization();

        group.MapGet("", async (
            ClaimsPrincipal principal,
            IUserRepository users,
            IConversationRepository conversations,
            IMessageRepository messages,
            CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();

            var user = await users.GetByIdAsync(userId, ct);
            if (user is null) return Results.Unauthorized();

            var list = await conversations.GetForUserAsync(userId, user.Role.ToString().ToLowerInvariant(), ct);

            var dtos = new List<ConversationDto>();
            foreach (var conv in list)
            {
                var unread = await messages.CountUnreadAsync(conv.Id, userId, ct);
                dtos.Add(new ConversationDto(
                    conv.Id,
                    conv.CustomerId,
                    conv.CustomerName,
                    conv.VendorId,
                    conv.VendorName,
                    conv.LastMessage,
                    conv.LastMessageTime.ToString("O"),
                    unread,
                    conv.BookingId));
            }

            return Results.Ok(dtos);
        });

        group.MapPost("/get-or-create", async (
            GetOrCreateConversationRequest req,
            ClaimsPrincipal principal,
            IUserRepository users,
            IBookingRepository bookings,
            IConversationRepository conversations,
            CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();

            // Ensure the caller is one of the participants.
            if (userId != req.CustomerId && userId != req.VendorId && !principal.IsInRole("admin"))
            {
                return Results.Forbid();
            }

            // Enforce: messaging is only allowed within an active (accepted) booking context.
            if (!string.IsNullOrWhiteSpace(req.BookingId))
            {
                var booking = await bookings.GetByIdAsync(req.BookingId, ct);
                if (booking is null) return Results.NotFound(new { message = "Booking not found" });
                if (booking.Status != BookingStatus.Accepted && booking.Status != BookingStatus.Completed)
                    return Results.BadRequest(new { message = "Messaging is only allowed for accepted or completed bookings" });

                // Reuse existing booking-linked conversation if one exists.
                var byBooking = await conversations.GetByBookingIdAsync(req.BookingId, ct);
                if (byBooking is not null)
                    return Results.Ok(new { id = byBooking.Id, bookingId = byBooking.BookingId });
            }
            else
            {
                // Fallback: look up by participants (for legacy / admin views).
                var existing = await conversations.GetByParticipantsAsync(req.CustomerId, req.VendorId, ct);
                if (existing is not null)
                    return Results.Ok(new { id = existing.Id, bookingId = existing.BookingId });
            }

            var customer = await users.GetByIdAsync(req.CustomerId, ct);
            var vendor = await users.GetByIdAsync(req.VendorId, ct);
            if (customer is null || vendor is null)
            {
                return Results.BadRequest(new { message = "Invalid participants" });
            }

            var conv = new Eventora.Domain.Messaging.Conversation
            {
                CustomerId = req.CustomerId,
                CustomerName = string.IsNullOrWhiteSpace(req.CustomerName) ? customer.FullName : req.CustomerName.Trim(),
                VendorId = req.VendorId,
                VendorName = string.IsNullOrWhiteSpace(req.VendorName) ? (vendor.BusinessName ?? vendor.FullName) : req.VendorName.Trim(),
                BookingId = string.IsNullOrWhiteSpace(req.BookingId) ? null : req.BookingId.Trim(),
                LastMessage = "No messages yet",
                LastMessageTime = DateTimeOffset.UtcNow,
            };

            await conversations.CreateAsync(conv, ct);
            return Results.Ok(new { id = conv.Id, bookingId = conv.BookingId });
        });

        group.MapGet("/{id}/messages", async (
            string id,
            ClaimsPrincipal principal,
            IConversationRepository conversations,
            IMessageRepository messages,
            CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();

            var conv = await conversations.GetByIdAsync(id, ct);
            if (conv is null) return Results.NotFound(new { message = "Conversation not found" });

            var isParticipant = conv.CustomerId == userId || conv.VendorId == userId;
            if (!isParticipant && !principal.IsInRole("admin")) return Results.Forbid();

            var list = await messages.GetForConversationAsync(id, ct);
            return Results.Ok(list.Select(m => new MessageDto(
                m.Id,
                m.ConversationId,
                m.SenderId,
                m.SenderName,
                m.ReceiverId,
                m.Content,
                m.Timestamp.ToString("O"),
                m.Read)));
        });

        group.MapPost("/{id}/messages", async (
            string id,
            SendMessageRequest req,
            ClaimsPrincipal principal,
            IConversationRepository conversations,
            IMessageRepository messages,
            IBookingRepository bookings,
            INotificationRepository notifications,
            IUserRepository users,
            CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();

            var sender = await users.GetByIdAsync(userId, ct);
            if (sender is null) return Results.Unauthorized();

            var conv = await conversations.GetByIdAsync(id, ct);
            if (conv is null) return Results.NotFound(new { message = "Conversation not found" });

            var isParticipant = conv.CustomerId == userId || conv.VendorId == userId;
            if (!isParticipant && !principal.IsInRole("admin")) return Results.Forbid();

            // SRS §4.5 & §5.5: communication must stay within an active booking context.
            // We still allow messaging on Completed bookings so parties can follow up after the event.
            if (!string.IsNullOrWhiteSpace(conv.BookingId))
            {
                var booking = await bookings.GetByIdAsync(conv.BookingId, ct);
                if (booking is null || (booking.Status != BookingStatus.Accepted && booking.Status != BookingStatus.Completed))
                    return Results.BadRequest(new { message = "Messaging is only allowed for accepted or completed bookings" });
            }

            // Ensure receiver is the other participant.
            var allowedReceivers = new HashSet<string>(StringComparer.Ordinal) { conv.CustomerId, conv.VendorId };
            if (!allowedReceivers.Contains(req.ReceiverId) || req.ReceiverId == userId)
            {
                return Results.BadRequest(new { message = "Invalid receiver" });
            }

            var message = new Eventora.Domain.Messaging.BookingMessage
            {
                ConversationId = id,
                SenderId = sender.Id,
                SenderName = sender.FullName,
                ReceiverId = req.ReceiverId,
                Content = req.Content.Trim(),
                Read = false,
            };

            await messages.CreateAsync(message, ct);

            conv.LastMessage = message.Content.Length > 50
                ? message.Content.Substring(0, 50) + "..."
                : message.Content;
            conv.LastMessageTime = DateTimeOffset.UtcNow;
            await conversations.UpdateAsync(conv, ct);

            await NotificationHelpers.CreateAsync(
                notifications,
                req.ReceiverId,
                NotificationType.Message,
                "New message",
                $"New message from {sender.FullName}",
                relatedBookingId: null,
                relatedDisputeId: null,
                ct);

            return Results.Ok(new MessageDto(
                message.Id,
                message.ConversationId,
                message.SenderId,
                message.SenderName,
                message.ReceiverId,
                message.Content,
                message.Timestamp.ToString("O"),
                message.Read));
        });

        group.MapPost("/{id}/read", async (
            string id,
            ClaimsPrincipal principal,
            IConversationRepository conversations,
            IMessageRepository messages,
            CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();

            var conv = await conversations.GetByIdAsync(id, ct);
            if (conv is null) return Results.NotFound(new { message = "Conversation not found" });

            var isParticipant = conv.CustomerId == userId || conv.VendorId == userId;
            if (!isParticipant && !principal.IsInRole("admin")) return Results.Forbid();

            await messages.MarkConversationReadAsync(id, userId, ct);
            return Results.Ok(new { success = true });
        });
    }
}
