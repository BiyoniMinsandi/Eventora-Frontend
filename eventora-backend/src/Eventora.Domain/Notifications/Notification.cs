using Eventora.Domain.Common;

namespace Eventora.Domain.Notifications;

/// <summary>
/// Notification delivered to a user.
/// </summary>
public sealed class Notification : EntityBase
{
    public string UserId { get; set; } = string.Empty;

    public NotificationType Type { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public string? RelatedBookingId { get; set; }

    public string? RelatedDisputeId { get; set; }

    public bool Read { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
