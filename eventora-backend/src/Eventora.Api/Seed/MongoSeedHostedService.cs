using Eventora.Application.Abstractions.Security;
using Eventora.Domain.Bookings;
using Eventora.Domain.Messaging;
using Eventora.Domain.Notifications;
using Eventora.Domain.Users;
using Eventora.Infrastructure.Mongo;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Eventora.Api.Seed;

/// <summary>
/// Seeds MongoDB with minimal demo data for local development.
/// </summary>
public sealed class MongoSeedHostedService : IHostedService
{
    private readonly IMongoDatabaseFactory _dbFactory;
    private readonly IPasswordHasher _hasher;
    private readonly IOptions<MongoSeedOptions> _options;
    private readonly ILogger<MongoSeedHostedService> _logger;

    public MongoSeedHostedService(
        IMongoDatabaseFactory dbFactory,
        IPasswordHasher hasher,
        IOptions<MongoSeedOptions> options,
        ILogger<MongoSeedHostedService> logger)
    {
        _dbFactory = dbFactory;
        _hasher = hasher;
        _options = options;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        if (!_options.Value.Enabled)
        {
            _logger.LogInformation("Mongo seeding disabled.");
            return;
        }

        // Fail fast if MongoDB isn't reachable to avoid a long default server-selection timeout.
        using var seedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        seedCts.CancelAfter(TimeSpan.FromSeconds(5));
        var seedToken = seedCts.Token;

        var db = _dbFactory.GetDatabase();

        var users = db.GetCollection<User>("users");
        var bookings = db.GetCollection<Eventora.Domain.Bookings.Booking>("bookings");
        var conversations = db.GetCollection<Conversation>("conversations");
        var messages = db.GetCollection<BookingMessage>("messages");
        var notifications = db.GetCollection<Notification>("notifications");

        try
        {
            await EnsureIndexesAsync(users, conversations, seedToken);
        }
        catch (Exception ex) when (ex is TimeoutException or MongoConnectionException or OperationCanceledException)
        {
            _logger.LogError(ex,
                "MongoDB is not reachable for seeding. Start MongoDB at the configured connection string (Mongo:ConnectionString) or disable seeding (Seed:Enabled=false)."
            );

            throw new InvalidOperationException(
                "MongoDB is not reachable for seeding. Ensure MongoDB is running or disable Seed:Enabled.",
                ex);
        }

        var admin = await UpsertUserAsync(users, new User
        {
            Email = _options.Value.AdminEmail,
            FullName = "System Admin",
            Role = UserRole.Admin,
            PasswordHash = _hasher.Hash(_options.Value.AdminPassword),
        }, seedToken);

        var customer = await UpsertUserAsync(users, new User
        {
            Email = _options.Value.DemoCustomerEmail,
            FullName = "Demo Customer",
            Role = UserRole.Customer,
            PasswordHash = _hasher.Hash(_options.Value.DemoPassword),
            Phone = "+1000000000",
        }, seedToken);

        var vendor = await UpsertUserAsync(users, new User
        {
            Email = _options.Value.DemoVendorEmail,
            FullName = "Demo Vendor",
            Role = UserRole.Vendor,
            PasswordHash = _hasher.Hash(_options.Value.DemoPassword),
            BusinessName = "Demo Events Co.",
            Category = "photography",
            Location = "Colombo",
            Description = "Professional event services for weddings and corporate events.",
            Services = ["Photography", "Videography"],
            Pricing = "From $500",
            Experience = "5+ years",
            Photos = [],
            Approved = true,
            ApprovedAt = DateTimeOffset.UtcNow,
        }, seedToken);

        // Pending vendor for admin approvals demo
        await UpsertUserAsync(users, new User
        {
            Email = "pendingvendor@example.com",
            FullName = "Pending Vendor",
            Role = UserRole.Vendor,
            PasswordHash = _hasher.Hash(_options.Value.DemoPassword),
            BusinessName = "Pending Catering",
            Category = "catering",
            Location = "Kandy",
            Description = "Pending approval vendor.",
            Approved = false,
        }, seedToken);

        // Seed one accepted booking + conversation + a notification.
        var existingBooking = await bookings.Find(b => b.CustomerId == customer.Id && b.VendorId == vendor.Id).FirstOrDefaultAsync(seedToken);
        if (existingBooking is null)
        {
            var booking = new Eventora.Domain.Bookings.Booking
            {
                Id = NewId(),
                CustomerId = customer.Id,
                CustomerName = customer.FullName,
                VendorId = vendor.Id,
                VendorName = vendor.FullName,
                VendorBusinessName = vendor.BusinessName ?? vendor.FullName,
                Service = "Photography",
                EventDate = DateTimeOffset.UtcNow.AddDays(14).ToString("yyyy-MM-dd"),
                EventType = "Wedding",
                GuestCount = 150,
                Budget = "$1000",
                SpecialRequests = "Please focus on candid shots.",
                Status = BookingStatus.Accepted,
                VendorResponseNote = "Happy to help!",
                CreatedAt = DateTimeOffset.UtcNow.AddDays(-2),
                UpdatedAt = DateTimeOffset.UtcNow.AddDays(-1),
            };

            await bookings.InsertOneAsync(booking, cancellationToken: seedToken);

            var conv = new Conversation
            {
                Id = NewId(),
                CustomerId = customer.Id,
                CustomerName = customer.FullName,
                VendorId = vendor.Id,
                VendorName = vendor.BusinessName ?? vendor.FullName,
                LastMessage = "Looking forward to the event!",
                LastMessageTime = DateTimeOffset.UtcNow.AddHours(-2),
                CreatedAt = DateTimeOffset.UtcNow.AddDays(-2),
                UpdatedAt = DateTimeOffset.UtcNow.AddHours(-2),
            };

            await conversations.InsertOneAsync(conv, cancellationToken: seedToken);

            var msg = new BookingMessage
            {
                Id = NewId(),
                ConversationId = conv.Id,
                SenderId = customer.Id,
                SenderName = customer.FullName,
                ReceiverId = vendor.Id,
                Content = "Looking forward to the event!",
                Timestamp = DateTimeOffset.UtcNow.AddHours(-2),
                Read = false,
            };

            await messages.InsertOneAsync(msg, cancellationToken: seedToken);

            await notifications.InsertOneAsync(new Notification
            {
                Id = NewId(),
                UserId = vendor.Id,
                Type = NotificationType.Message,
                Title = "New message",
                Message = $"New message from {customer.FullName}",
                Read = false,
                CreatedAt = DateTimeOffset.UtcNow.AddHours(-2),
            }, cancellationToken: seedToken);

            _logger.LogInformation("Seeded demo booking + conversation.");
        }

        _logger.LogInformation("Mongo seed complete. Admin: {Email}", admin.Email);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private static string NewId() => ObjectId.GenerateNewId().ToString();

    private static async Task EnsureIndexesAsync(
        IMongoCollection<User> users,
        IMongoCollection<Conversation> conversations,
        CancellationToken ct)
    {
        // Unique email index
        var emailIndex = new CreateIndexModel<User>(
            Builders<User>.IndexKeys.Ascending(u => u.Email),
            new CreateIndexOptions { Unique = true, Name = "ux_users_email" });

        await users.Indexes.CreateOneAsync(emailIndex, cancellationToken: ct);

        // Unique (CustomerId, VendorId) conversation index
        var convIndex = new CreateIndexModel<Conversation>(
            Builders<Conversation>.IndexKeys
                .Ascending(c => c.CustomerId)
                .Ascending(c => c.VendorId),
            new CreateIndexOptions { Unique = true, Name = "ux_conversations_participants" });

        await conversations.Indexes.CreateOneAsync(convIndex, cancellationToken: ct);
    }

    private static async Task<User> UpsertUserAsync(IMongoCollection<User> users, User seed, CancellationToken ct)
    {
        var normalizedEmail = (seed.Email ?? string.Empty).Trim().ToLowerInvariant();
        var existing = await users.Find(u => u.Email == normalizedEmail).FirstOrDefaultAsync(ct);
        if (existing is not null)
        {
            // Keep existing password and profile if user was modified.
            return existing;
        }

        seed.Id = string.IsNullOrWhiteSpace(seed.Id) ? NewId() : seed.Id;
        seed.Email = normalizedEmail;
        seed.CreatedAt = DateTimeOffset.UtcNow;
        seed.UpdatedAt = DateTimeOffset.UtcNow;

        await users.InsertOneAsync(seed, cancellationToken: ct);
        return seed;
    }
}
