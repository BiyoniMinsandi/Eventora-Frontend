using Eventora.Application.Abstractions.Persistence;
using Eventora.Domain.Notifications;

namespace Eventora.Api.Endpoints;

internal static class NotificationHelpers
{
    public static async Task CreateAsync(
        INotificationRepository notifications,
        string userId,
        NotificationType type,
        string title,
        string message,
        string? relatedBookingId,
        string? relatedDisputeId,
        CancellationToken ct)
    {
        var notification = new Notification
        {
            UserId = userId,
            Type = type,
            Title = title,
            Message = message,
            RelatedBookingId = relatedBookingId,
            RelatedDisputeId = relatedDisputeId,
            Read = false,
        };

        await notifications.CreateAsync(notification, ct);
    }
}
