using Eventora.Domain.Bookings;
using Eventora.Domain.Disputes;
using Eventora.Domain.Messaging;
using Eventora.Domain.Notifications;
using Eventora.Domain.Reviews;
using Eventora.Domain.Users;
using Eventora.Infrastructure.Mongo;
using MongoDB.Driver;

namespace Eventora.Infrastructure.Persistence;

/// <summary>
/// Provides typed MongoDB collections for all domain entities.
/// Collection names are fixed strings so they never drift between deployments.
/// </summary>
internal sealed class MongoCollections(IMongoDatabaseFactory dbFactory)
{
    private readonly IMongoDatabase _db = dbFactory.GetDatabase();

    public IMongoCollection<User> Users => _db.GetCollection<User>("users");
    public IMongoCollection<Booking> Bookings => _db.GetCollection<Booking>("bookings");
    public IMongoCollection<Conversation> Conversations => _db.GetCollection<Conversation>("conversations");
    public IMongoCollection<BookingMessage> Messages => _db.GetCollection<BookingMessage>("messages");
    public IMongoCollection<Review> Reviews => _db.GetCollection<Review>("reviews");
    public IMongoCollection<Dispute> Disputes => _db.GetCollection<Dispute>("disputes");

    /// <summary>Structured messages within a dispute thread (separate from booking messages).</summary>
    public IMongoCollection<DisputeMessage> DisputeMessages => _db.GetCollection<DisputeMessage>("dispute_messages");

    public IMongoCollection<Notification> Notifications => _db.GetCollection<Notification>("notifications");
}
