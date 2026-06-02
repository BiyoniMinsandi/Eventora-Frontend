namespace Eventora.Application.Contracts.Notifications;

public sealed record NotificationDto(
    string Id,
    string UserId,
    string Type,
    string Title,
    string Message,
    string? RelatedBookingId,
    string? RelatedDisputeId,
    bool Read,
    string CreatedAt);

public static class NotificationDtoMapping
{
    public static NotificationDto ToDto(Eventora.Domain.Notifications.Notification notification)
    {
        return new NotificationDto(
            notification.Id,
            notification.UserId,
            Eventora.Domain.Notifications.NotificationTypeMapping.ToApiString(notification.Type),
            notification.Title,
            notification.Message,
            notification.RelatedBookingId,
            notification.RelatedDisputeId,
            notification.Read,
            notification.CreatedAt.ToString("O"));
    }
}
