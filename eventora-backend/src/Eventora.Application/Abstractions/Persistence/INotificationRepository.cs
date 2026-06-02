using Eventora.Domain.Notifications;

namespace Eventora.Application.Abstractions.Persistence;

/// <summary>
/// Notification persistence operations.
/// </summary>
public interface INotificationRepository
{
    Task<IReadOnlyList<Notification>> GetForUserAsync(string userId, CancellationToken ct);
    Task CreateAsync(Notification notification, CancellationToken ct);
    Task MarkReadAsync(string notificationId, string userId, CancellationToken ct);
    Task MarkAllReadAsync(string userId, CancellationToken ct);
}
