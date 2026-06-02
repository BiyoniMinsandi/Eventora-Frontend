using Eventora.Application.Abstractions.Persistence;
using Eventora.Domain.Notifications;
using MongoDB.Driver;

namespace Eventora.Infrastructure.Persistence;

/// <summary>
/// MongoDB implementation for notifications.
/// </summary>
internal sealed class MongoNotificationRepository(MongoCollections collections) : INotificationRepository
{
    private readonly IMongoCollection<Notification> _notifications = collections.Notifications;

    public async Task<IReadOnlyList<Notification>> GetForUserAsync(string userId, CancellationToken ct)
    {
        return await _notifications
            .Find(n => n.UserId == userId)
            .SortByDescending(n => n.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task CreateAsync(Notification notification, CancellationToken ct)
    {
        MongoId.EnsureId(notification, n => n.Id, (n, v) => n.Id = v);
        notification.CreatedAt = DateTimeOffset.UtcNow;
        await _notifications.InsertOneAsync(notification, cancellationToken: ct);
    }

    public async Task MarkReadAsync(string notificationId, string userId, CancellationToken ct)
    {
        var filter = Builders<Notification>.Filter.Eq(n => n.Id, notificationId)
                     & Builders<Notification>.Filter.Eq(n => n.UserId, userId);

        var update = Builders<Notification>.Update.Set(n => n.Read, true);
        await _notifications.UpdateOneAsync(filter, update, cancellationToken: ct);
    }

    public async Task MarkAllReadAsync(string userId, CancellationToken ct)
    {
        var filter = Builders<Notification>.Filter.Eq(n => n.UserId, userId)
                     & Builders<Notification>.Filter.Eq(n => n.Read, false);

        var update = Builders<Notification>.Update.Set(n => n.Read, true);
        await _notifications.UpdateManyAsync(filter, update, cancellationToken: ct);
    }
}
