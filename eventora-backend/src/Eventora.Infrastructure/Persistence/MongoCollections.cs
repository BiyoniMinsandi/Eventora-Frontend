using Eventora.Domain.Bookings;
using Eventora.Domain.Disputes;
using Eventora.Domain.Messaging;
using Eventora.Domain.Notifications;
using Eventora.Domain.Reviews;
using Eventora.Domain.Users;
using Eventora.Infrastructure.Mongo;
using MongoDB.Driver;

namespace Eventora.Infrastructure.Persistence;

internal sealed class MongoCollections(IMongoDatabaseFactory dbFactory)
{
    private readonly IMongoDatabase _db = dbFactory.GetDatabase();

    public IMongoCollection<User> Users => _db.GetCollection<User>("users");
    public IMongoCollection<Booking> Bookings => _db.GetCollection<Booking>("bookings");
    public IMongoCollection<Conversation> Conversations => _db.GetCollection<Conversation>("conversations");
    public IMongoCollection<BookingMessage> Messages => _db.GetCollection<BookingMessage>("messages");
    public IMongoCollection<Review> Reviews => _db.GetCollection<Review>("reviews");
    public IMongoCollection<Dispute> Disputes => _db.GetCollection<Dispute>("disputes");
    public IMongoCollection<Notification> Notifications => _db.GetCollection<Notification>("notifications");
}
