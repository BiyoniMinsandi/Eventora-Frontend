using Eventora.Application.Abstractions.Security;
using Eventora.Domain.Bookings;
using Eventora.Domain.Messaging;
using Eventora.Domain.Notifications;
using Eventora.Domain.Reviews;
using Eventora.Domain.Users;
using Eventora.Infrastructure.Mongo;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Eventora.Api.Seed;

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

        using var seedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        seedCts.CancelAfter(TimeSpan.FromSeconds(10));
        var ct = seedCts.Token;

        var db = _dbFactory.GetDatabase();

        var users         = db.GetCollection<User>("users");
        var bookings      = db.GetCollection<Booking>("bookings");
        var conversations = db.GetCollection<Conversation>("conversations");
        var messages      = db.GetCollection<BookingMessage>("messages");
        var reviews       = db.GetCollection<Review>("reviews");
        var notifications = db.GetCollection<Notification>("notifications");

        try
        {
            await EnsureIndexesAsync(users, conversations, ct);
        }
        catch (Exception ex) when (ex is TimeoutException or MongoConnectionException or OperationCanceledException)
        {
            _logger.LogError(ex,
                "MongoDB is not reachable. Start MongoDB or disable seeding (Seed:Enabled=false).");
            throw new InvalidOperationException("MongoDB is not reachable.", ex);
        }

        var pwd = _options.Value.DemoPassword;

        // ── Admin ─────────────────────────────────────────────────────────────
        var admin = await UpsertUserAsync(users, new User
        {
            Email        = _options.Value.AdminEmail,
            FullName     = "System Admin",
            Role         = UserRole.Admin,
            PasswordHash = _hasher.Hash(_options.Value.AdminPassword),
            Phone        = "+94711000000",
        }, ct);

        // ── Customers ─────────────────────────────────────────────────────────
        var customer1 = await UpsertUserAsync(users, new User
        {
            Email        = _options.Value.DemoCustomerEmail,
            FullName     = "Sarah Fernando",
            Role         = UserRole.Customer,
            PasswordHash = _hasher.Hash(pwd),
            Phone        = "+94771234567",
        }, ct);

        var customer2 = await UpsertUserAsync(users, new User
        {
            Email        = "james@example.com",
            FullName     = "James Perera",
            Role         = UserRole.Customer,
            PasswordHash = _hasher.Hash(pwd),
            Phone        = "+94779876543",
        }, ct);

        var customer3 = await UpsertUserAsync(users, new User
        {
            Email        = "priya@example.com",
            FullName     = "Priya Nair",
            Role         = UserRole.Customer,
            PasswordHash = _hasher.Hash(pwd),
            Phone        = "+94762345678",
        }, ct);

        var customer4 = await UpsertUserAsync(users, new User
        {
            Email        = "michael@example.com",
            FullName     = "Michael Silva",
            Role         = UserRole.Customer,
            PasswordHash = _hasher.Hash(pwd),
            Phone        = "+94755678901",
        }, ct);

        // ── Approved Vendors ──────────────────────────────────────────────────
        // Keep the original demo vendor account (vendor@example.com) for easy login testing
        await UpsertUserAsync(users, new User
        {
            Email        = _options.Value.DemoVendorEmail,
            FullName     = "Demo Vendor",
            Role         = UserRole.Vendor,
            PasswordHash = _hasher.Hash(pwd),
            BusinessName = "Demo Events Co.",
            Category     = "photography",
            Location     = "Colombo",
            Description  = "Demo vendor account for testing.",
            Services     = ["Photography", "Videography"],
            Pricing      = "From Rs. 50,000",
            PriceMin     = 50000,
            PriceMax     = 100000,
            Experience   = "5+ years",
            Photos       = [],
            Approved     = true,
            ApprovedAt   = DateTimeOffset.UtcNow.AddDays(-60),
        }, ct);

        var vendor1 = await UpsertUserAsync(users, new User
        {
            Email        = "chamara@example.com",
            FullName     = "Chamara Bandara",
            Role         = UserRole.Vendor,
            PasswordHash = _hasher.Hash(pwd),
            Phone        = "+94701111111",
            BusinessName = "Lens & Light Photography",
            Category     = "photography",
            Location     = "Colombo",
            Description  = "Award-winning wedding and event photography studio with 8 years of experience capturing timeless moments across Sri Lanka.",
            Services     = ["Wedding Photography", "Event Photography", "Videography", "Drone Footage", "Photo Albums"],
            Pricing      = "Rs. 45,000 – 150,000",
            PriceMin     = 45000,
            PriceMax     = 150000,
            Experience   = "8 years",
            Photos       = [
                "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800",
                "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
                "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
            ],
            Approved     = true,
            ApprovedAt   = DateTimeOffset.UtcNow.AddDays(-30),
            Availability = AvailabilityFor(30),
        }, ct);

        var vendor2 = await UpsertUserAsync(users, new User
        {
            Email        = "harmony@example.com",
            FullName     = "Dinesh Rajapaksa",
            Role         = UserRole.Vendor,
            PasswordHash = _hasher.Hash(pwd),
            Phone        = "+94702222222",
            BusinessName = "Harmony Sounds",
            Category     = "music",
            Location     = "Colombo",
            Description  = "Professional DJ and live band services for weddings, corporate events, and private parties. Full sound and lighting setup included.",
            Services     = ["DJ Services", "Live Band", "Sound System", "Lighting Setup", "MC Services"],
            Pricing      = "Rs. 30,000 – 90,000",
            PriceMin     = 30000,
            PriceMax     = 90000,
            Experience   = "6 years",
            Photos       = [
                "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
                "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
            ],
            Approved     = true,
            ApprovedAt   = DateTimeOffset.UtcNow.AddDays(-25),
            Availability = AvailabilityFor(30),
        }, ct);

        var vendor3 = await UpsertUserAsync(users, new User
        {
            Email        = "bloom@example.com",
            FullName     = "Nimali Senanayake",
            Role         = UserRole.Vendor,
            PasswordHash = _hasher.Hash(pwd),
            Phone        = "+94703333333",
            BusinessName = "Bloom Decor",
            Category     = "decoration",
            Location     = "Kandy",
            Description  = "Creative floral and event decoration specialists. We transform any venue into a breathtaking space with custom themes and designs.",
            Services     = ["Floral Arrangements", "Stage Decoration", "Table Settings", "Balloon Decor", "Theme Setup"],
            Pricing      = "Rs. 25,000 – 80,000",
            PriceMin     = 25000,
            PriceMax     = 80000,
            Experience   = "5 years",
            Photos       = [
                "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800",
                "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
            ],
            Approved     = true,
            ApprovedAt   = DateTimeOffset.UtcNow.AddDays(-20),
            Availability = AvailabilityFor(30),
        }, ct);

        var vendor4 = await UpsertUserAsync(users, new User
        {
            Email        = "royalbites@example.com",
            FullName     = "Ruwan Jayawardena",
            Role         = UserRole.Vendor,
            PasswordHash = _hasher.Hash(pwd),
            Phone        = "+94704444444",
            BusinessName = "Royal Bites Catering",
            Category     = "catering",
            Location     = "Galle",
            Description  = "Premium catering service specialising in traditional Sri Lankan and Western buffet cuisine. Hygiene-certified with a team of 20+ professional chefs.",
            Services     = ["Buffet Catering", "Cocktail Reception", "Wedding Cake", "Corporate Lunches", "Live Cooking Stations"],
            Pricing      = "Rs. 1,200 – 3,500 per head",
            PriceMin     = 1200,
            PriceMax     = 3500,
            Experience   = "10 years",
            Photos       = [
                "https://images.unsplash.com/photo-1555244162-803834f70033?w=800",
                "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
            ],
            Approved     = true,
            ApprovedAt   = DateTimeOffset.UtcNow.AddDays(-15),
            Availability = AvailabilityFor(30),
        }, ct);

        var vendor5 = await UpsertUserAsync(users, new User
        {
            Email        = "glamgrace@example.com",
            FullName     = "Kavindya Wijesinghe",
            Role         = UserRole.Vendor,
            PasswordHash = _hasher.Hash(pwd),
            Phone        = "+94705555555",
            BusinessName = "Glam & Grace Beauty",
            Category     = "beauty",
            Location     = "Colombo",
            Description  = "Bridal and event makeup and hair styling studio. On-location service available island-wide. Specialise in traditional and contemporary looks.",
            Services     = ["Bridal Makeup", "Hair Styling", "Pre-Wedding Shoot Makeup", "Group Packages", "On-Site Service"],
            Pricing      = "Rs. 15,000 – 60,000",
            PriceMin     = 15000,
            PriceMax     = 60000,
            Experience   = "7 years",
            Photos       = [
                "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800",
                "https://images.unsplash.com/photo-1560066984-138daaa7e20c?w=800",
            ],
            Approved     = true,
            ApprovedAt   = DateTimeOffset.UtcNow.AddDays(-10),
            Availability = AvailabilityFor(30),
        }, ct);

        var vendor6 = await UpsertUserAsync(users, new User
        {
            Email        = "grandvista@example.com",
            FullName     = "Asitha Koswatte",
            Role         = UserRole.Vendor,
            PasswordHash = _hasher.Hash(pwd),
            Phone        = "+94706666666",
            BusinessName = "Grand Vista Venues",
            Category     = "venue",
            Location     = "Colombo",
            Description  = "Luxury event venue with panoramic city views. Accommodates up to 500 guests. Fully air-conditioned halls with integrated AV systems and in-house catering.",
            Services     = ["Banquet Hall", "Garden Venue", "Board Room", "AV Equipment", "In-House Catering"],
            Pricing      = "Rs. 150,000 – 500,000",
            PriceMin     = 150000,
            PriceMax     = 500000,
            Experience   = "12 years",
            Photos       = [
                "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800",
                "https://images.unsplash.com/photo-1561912774-79769a0a0a7a?w=800",
            ],
            Approved     = true,
            ApprovedAt   = DateTimeOffset.UtcNow.AddDays(-5),
            Availability = AvailabilityFor(30),
        }, ct);

        // ── Pending vendors (for admin approvals demo) ────────────────────────
        await UpsertUserAsync(users, new User
        {
            Email        = "pendingvendor@example.com",
            FullName     = "Saman Kumara",
            Role         = UserRole.Vendor,
            PasswordHash = _hasher.Hash(pwd),
            BusinessName = "Perfect Catering",
            Category     = "catering",
            Location     = "Kandy",
            Description  = "Specialised in traditional Sri Lankan wedding catering with 200+ successful events.",
            Approved     = false,
        }, ct);

        await UpsertUserAsync(users, new User
        {
            Email        = "pendingvendor2@example.com",
            FullName     = "Dilani Rathnayake",
            Role         = UserRole.Vendor,
            PasswordHash = _hasher.Hash(pwd),
            BusinessName = "StarShot Studios",
            Category     = "photography",
            Location     = "Negombo",
            Description  = "Cinematic wedding films and photography. Available island-wide.",
            Approved     = false,
        }, ct);

        // ── Bookings ──────────────────────────────────────────────────────────
        // Each booking is created only once (idempotent check on CustomerId+VendorId+EventDate).

        // 1. Completed — Sarah + Lens & Light (past event, has review)
        var b1 = await UpsertBookingAsync(bookings, new Booking
        {
            Id                  = NewId(),
            CustomerId          = customer1.Id,
            CustomerName        = customer1.FullName,
            VendorId            = vendor1.Id,
            VendorName          = vendor1.FullName,
            VendorBusinessName  = vendor1.BusinessName!,
            Service             = "Wedding Photography",
            EventDate           = Ago(30),
            EventType           = "Wedding",
            GuestCount          = 200,
            Budget              = "Rs. 80,000",
            SpecialRequests     = "Focus on candid shots and family portraits.",
            Status              = BookingStatus.Completed,
            VendorResponseNote  = "We would love to capture your special day!",
            CreatedAt           = DateTimeOffset.UtcNow.AddDays(-45),
            UpdatedAt           = DateTimeOffset.UtcNow.AddDays(-30),
        }, ct);

        // 2. Completed — James + Harmony Sounds (past event, has review)
        var b2 = await UpsertBookingAsync(bookings, new Booking
        {
            Id                  = NewId(),
            CustomerId          = customer2.Id,
            CustomerName        = customer2.FullName,
            VendorId            = vendor2.Id,
            VendorName          = vendor2.FullName,
            VendorBusinessName  = vendor2.BusinessName!,
            Service             = "DJ Services",
            EventDate           = Ago(20),
            EventType           = "Birthday Party",
            GuestCount          = 80,
            Budget              = "Rs. 45,000",
            SpecialRequests     = "Need a mix of Sinhala and English pop hits.",
            Status              = BookingStatus.Completed,
            VendorResponseNote  = "We have an amazing set lined up for you!",
            CreatedAt           = DateTimeOffset.UtcNow.AddDays(-35),
            UpdatedAt           = DateTimeOffset.UtcNow.AddDays(-20),
        }, ct);

        // 3. Accepted — Priya + Bloom Decor (upcoming)
        var b3 = await UpsertBookingAsync(bookings, new Booking
        {
            Id                  = NewId(),
            CustomerId          = customer3.Id,
            CustomerName        = customer3.FullName,
            VendorId            = vendor3.Id,
            VendorName          = vendor3.FullName,
            VendorBusinessName  = vendor3.BusinessName!,
            Service             = "Stage Decoration",
            EventDate           = Ahead(14),
            EventType           = "Engagement",
            GuestCount          = 120,
            Budget              = "Rs. 55,000",
            SpecialRequests     = "Prefer pastel pink and white colour theme.",
            Status              = BookingStatus.Accepted,
            VendorResponseNote  = "Lovely theme choice! We will send a mood board.",
            CreatedAt           = DateTimeOffset.UtcNow.AddDays(-7),
            UpdatedAt           = DateTimeOffset.UtcNow.AddDays(-5),
        }, ct);

        // 4. Accepted — Michael + Royal Bites Catering (upcoming)
        var b4 = await UpsertBookingAsync(bookings, new Booking
        {
            Id                  = NewId(),
            CustomerId          = customer4.Id,
            CustomerName        = customer4.FullName,
            VendorId            = vendor4.Id,
            VendorName          = vendor4.FullName,
            VendorBusinessName  = vendor4.BusinessName!,
            Service             = "Buffet Catering",
            EventDate           = Ahead(21),
            EventType           = "Corporate Event",
            GuestCount          = 300,
            Budget              = "Rs. 900,000",
            SpecialRequests     = "Vegetarian options required for 30% of guests.",
            Status              = BookingStatus.Accepted,
            VendorResponseNote  = "We will ensure a separate vegetarian station.",
            CreatedAt           = DateTimeOffset.UtcNow.AddDays(-10),
            UpdatedAt           = DateTimeOffset.UtcNow.AddDays(-8),
        }, ct);

        // 5. Pending — Sarah + Glam & Grace (awaiting vendor response)
        var b5 = await UpsertBookingAsync(bookings, new Booking
        {
            Id                  = NewId(),
            CustomerId          = customer1.Id,
            CustomerName        = customer1.FullName,
            VendorId            = vendor5.Id,
            VendorName          = vendor5.FullName,
            VendorBusinessName  = vendor5.BusinessName!,
            Service             = "Bridal Makeup",
            EventDate           = Ahead(30),
            EventType           = "Wedding",
            GuestCount          = 1,
            Budget              = "Rs. 25,000",
            SpecialRequests     = "Looking for a natural dewy look.",
            Status              = BookingStatus.Pending,
            CreatedAt           = DateTimeOffset.UtcNow.AddDays(-1),
            UpdatedAt           = DateTimeOffset.UtcNow.AddDays(-1),
        }, ct);

        // 6. Pending — James + Grand Vista Venues (awaiting vendor response)
        var b6 = await UpsertBookingAsync(bookings, new Booking
        {
            Id                  = NewId(),
            CustomerId          = customer2.Id,
            CustomerName        = customer2.FullName,
            VendorId            = vendor6.Id,
            VendorName          = vendor6.FullName,
            VendorBusinessName  = vendor6.BusinessName!,
            Service             = "Banquet Hall",
            EventDate           = Ahead(45),
            EventType           = "Wedding Reception",
            GuestCount          = 400,
            Budget              = "Rs. 350,000",
            SpecialRequests     = "Need the rooftop garden area for the cocktail hour.",
            Status              = BookingStatus.Pending,
            CreatedAt           = DateTimeOffset.UtcNow.AddHours(-6),
            UpdatedAt           = DateTimeOffset.UtcNow.AddHours(-6),
        }, ct);

        // 7. Rejected — Priya + Lens & Light (vendor was unavailable)
        var b7 = await UpsertBookingAsync(bookings, new Booking
        {
            Id                  = NewId(),
            CustomerId          = customer3.Id,
            CustomerName        = customer3.FullName,
            VendorId            = vendor1.Id,
            VendorName          = vendor1.FullName,
            VendorBusinessName  = vendor1.BusinessName!,
            Service             = "Event Photography",
            EventDate           = Ahead(7),
            EventType           = "Birthday Party",
            GuestCount          = 50,
            Budget              = "Rs. 30,000",
            Status              = BookingStatus.Rejected,
            VendorResponseNote  = "Unfortunately we are fully booked on this date. Please try another date.",
            CreatedAt           = DateTimeOffset.UtcNow.AddDays(-3),
            UpdatedAt           = DateTimeOffset.UtcNow.AddDays(-2),
        }, ct);

        // 8. Cancelled — Michael + Bloom Decor (customer cancelled)
        var b8 = await UpsertBookingAsync(bookings, new Booking
        {
            Id                  = NewId(),
            CustomerId          = customer4.Id,
            CustomerName        = customer4.FullName,
            VendorId            = vendor3.Id,
            VendorName          = vendor3.FullName,
            VendorBusinessName  = vendor3.BusinessName!,
            Service             = "Floral Arrangements",
            EventDate           = Ahead(10),
            EventType           = "Anniversary",
            GuestCount          = 60,
            Budget              = "Rs. 20,000",
            Status              = BookingStatus.Cancelled,
            CreatedAt           = DateTimeOffset.UtcNow.AddDays(-5),
            UpdatedAt           = DateTimeOffset.UtcNow.AddDays(-4),
        }, ct);

        // ── Conversations + Messages (for accepted/completed bookings) ─────────
        var conv1 = await UpsertConversationAsync(conversations, new Conversation
        {
            Id              = NewId(),
            CustomerId      = customer1.Id,
            CustomerName    = customer1.FullName,
            VendorId        = vendor1.Id,
            VendorName      = vendor1.BusinessName!,
            LastMessage     = "Thank you so much! The photos are absolutely stunning.",
            LastMessageTime = DateTimeOffset.UtcNow.AddDays(-29),
            CreatedAt       = DateTimeOffset.UtcNow.AddDays(-44),
            UpdatedAt       = DateTimeOffset.UtcNow.AddDays(-29),
        }, ct);

        await UpsertMessagesAsync(messages, conv1.Id, [
            (customer1.Id, customer1.FullName, vendor1.Id, "Hi! We're so excited for our wedding shoot. Any tips on what to wear?", DateTimeOffset.UtcNow.AddDays(-44)),
            (vendor1.Id,   vendor1.FullName,  customer1.Id, "Congratulations! Soft pastel colours photograph beautifully. Avoid busy patterns.", DateTimeOffset.UtcNow.AddDays(-43)),
            (customer1.Id, customer1.FullName, vendor1.Id, "Perfect, thank you! Will you bring a second shooter?", DateTimeOffset.UtcNow.AddDays(-42)),
            (vendor1.Id,   vendor1.FullName,  customer1.Id, "Yes, we always bring a second shooter for weddings. You're in good hands!", DateTimeOffset.UtcNow.AddDays(-41)),
            (customer1.Id, customer1.FullName, vendor1.Id, "Thank you so much! The photos are absolutely stunning.", DateTimeOffset.UtcNow.AddDays(-29)),
        ], ct);

        var conv3 = await UpsertConversationAsync(conversations, new Conversation
        {
            Id              = NewId(),
            CustomerId      = customer3.Id,
            CustomerName    = customer3.FullName,
            VendorId        = vendor3.Id,
            VendorName      = vendor3.BusinessName!,
            LastMessage     = "The mood board looks incredible, we love it!",
            LastMessageTime = DateTimeOffset.UtcNow.AddDays(-4),
            CreatedAt       = DateTimeOffset.UtcNow.AddDays(-6),
            UpdatedAt       = DateTimeOffset.UtcNow.AddDays(-4),
        }, ct);

        await UpsertMessagesAsync(messages, conv3.Id, [
            (vendor3.Id,   vendor3.FullName,  customer3.Id, "Hello Priya! I've put together a mood board for your engagement. Sending it over now.", DateTimeOffset.UtcNow.AddDays(-5)),
            (customer3.Id, customer3.FullName, vendor3.Id, "The mood board looks incredible, we love it!", DateTimeOffset.UtcNow.AddDays(-4)),
            (vendor3.Id,   vendor3.FullName,  customer3.Id, "Wonderful! We'll begin sourcing the flowers this week.", DateTimeOffset.UtcNow.AddDays(-4)),
        ], ct);

        var conv4 = await UpsertConversationAsync(conversations, new Conversation
        {
            Id              = NewId(),
            CustomerId      = customer4.Id,
            CustomerName    = customer4.FullName,
            VendorId        = vendor4.Id,
            VendorName      = vendor4.BusinessName!,
            LastMessage     = "We will have a dedicated vegetarian section with full labelling.",
            LastMessageTime = DateTimeOffset.UtcNow.AddDays(-7),
            CreatedAt       = DateTimeOffset.UtcNow.AddDays(-9),
            UpdatedAt       = DateTimeOffset.UtcNow.AddDays(-7),
        }, ct);

        await UpsertMessagesAsync(messages, conv4.Id, [
            (customer4.Id, customer4.FullName, vendor4.Id, "Can you accommodate guests with nut allergies?", DateTimeOffset.UtcNow.AddDays(-9)),
            (vendor4.Id,   vendor4.FullName,  customer4.Id, "Absolutely. We will clearly label all dishes and keep nut-free items separate.", DateTimeOffset.UtcNow.AddDays(-8)),
            (customer4.Id, customer4.FullName, vendor4.Id, "Also please note 30% need vegetarian options.", DateTimeOffset.UtcNow.AddDays(-8)),
            (vendor4.Id,   vendor4.FullName,  customer4.Id, "We will have a dedicated vegetarian section with full labelling.", DateTimeOffset.UtcNow.AddDays(-7)),
        ], ct);

        // ── Reviews (for completed bookings) ──────────────────────────────────
        await UpsertReviewAsync(reviews, new Review
        {
            Id           = NewId(),
            BookingId    = b1.Id,
            CustomerId   = customer1.Id,
            CustomerName = customer1.FullName,
            VendorId     = vendor1.Id,
            Rating       = 5,
            Comment      = "Chamara and his team were absolutely phenomenal! Every moment was captured beautifully. The candid shots brought tears to our eyes. Highly recommend Lens & Light to any couple!",
            CreatedAt    = DateTimeOffset.UtcNow.AddDays(-28),
        }, ct);

        await UpsertReviewAsync(reviews, new Review
        {
            Id           = NewId(),
            BookingId    = b2.Id,
            CustomerId   = customer2.Id,
            CustomerName = customer2.FullName,
            VendorId     = vendor2.Id,
            Rating       = 4,
            Comment      = "Dinesh kept the energy going all night! Great music selection and the lighting setup was impressive. Minor issue with the mic at the start but it was sorted quickly. Would book again.",
            CreatedAt    = DateTimeOffset.UtcNow.AddDays(-18),
        }, ct);

        // ── Notifications ──────────────────────────────────────────────────────
        await UpsertNotificationsAsync(notifications, [
            // Vendor1 (Chamara) — new booking request from Priya (b7, rejected later)
            new Notification { Id = NewId(), UserId = vendor1.Id, Type = NotificationType.BookingRequest,
                Title = "New booking request", Message = "Priya Nair has requested Event Photography for a Birthday Party.",
                RelatedBookingId = b7.Id, Read = true, CreatedAt = DateTimeOffset.UtcNow.AddDays(-3) },

            // Vendor5 (Kavindya) — new pending request from Sarah (b5)
            new Notification { Id = NewId(), UserId = vendor5.Id, Type = NotificationType.BookingRequest,
                Title = "New booking request", Message = "Sarah Fernando has requested Bridal Makeup for a Wedding.",
                RelatedBookingId = b5.Id, Read = false, CreatedAt = DateTimeOffset.UtcNow.AddDays(-1) },

            // Vendor6 (Asitha) — new pending request from James (b6)
            new Notification { Id = NewId(), UserId = vendor6.Id, Type = NotificationType.BookingRequest,
                Title = "New booking request", Message = "James Perera has requested Banquet Hall for a Wedding Reception.",
                RelatedBookingId = b6.Id, Read = false, CreatedAt = DateTimeOffset.UtcNow.AddHours(-6) },

            // Customer1 (Sarah) — booking accepted by Vendor3 through b3 (different customer but keep realistic)
            new Notification { Id = NewId(), UserId = customer3.Id, Type = NotificationType.BookingAccepted,
                Title = "Booking accepted", Message = "Bloom Decor has accepted your Stage Decoration booking.",
                RelatedBookingId = b3.Id, Read = true, CreatedAt = DateTimeOffset.UtcNow.AddDays(-5) },

            // Customer2 (James) — booking accepted
            new Notification { Id = NewId(), UserId = customer4.Id, Type = NotificationType.BookingAccepted,
                Title = "Booking accepted", Message = "Royal Bites Catering has accepted your Buffet Catering booking.",
                RelatedBookingId = b4.Id, Read = true, CreatedAt = DateTimeOffset.UtcNow.AddDays(-8) },

            // Customer3 (Priya) — booking rejected
            new Notification { Id = NewId(), UserId = customer3.Id, Type = NotificationType.BookingRejected,
                Title = "Booking not available", Message = "Lens & Light Photography is unavailable on your selected date.",
                RelatedBookingId = b7.Id, Read = false, CreatedAt = DateTimeOffset.UtcNow.AddDays(-2) },

            // Customer1 (Sarah) — review prompt after completed booking
            new Notification { Id = NewId(), UserId = customer1.Id, Type = NotificationType.ReviewPrompt,
                Title = "How was your event?", Message = "Your event with Lens & Light Photography is complete. Leave a review!",
                RelatedBookingId = b1.Id, Read = true, CreatedAt = DateTimeOffset.UtcNow.AddDays(-30) },

            // Customer2 (James) — review prompt
            new Notification { Id = NewId(), UserId = customer2.Id, Type = NotificationType.ReviewPrompt,
                Title = "How was your event?", Message = "Your event with Harmony Sounds is complete. Leave a review!",
                RelatedBookingId = b2.Id, Read = false, CreatedAt = DateTimeOffset.UtcNow.AddDays(-20) },

            // Vendor1 (Chamara) — received a 5-star review
            new Notification { Id = NewId(), UserId = vendor1.Id, Type = NotificationType.Message,
                Title = "New 5-star review!", Message = "Sarah Fernando left you a 5-star review.",
                Read = false, CreatedAt = DateTimeOffset.UtcNow.AddDays(-28) },

            // Vendor1 — vendor approval notification
            new Notification { Id = NewId(), UserId = vendor1.Id, Type = NotificationType.VendorApproved,
                Title = "Account approved", Message = "Your vendor account has been approved. You can now receive bookings.",
                Read = true, CreatedAt = DateTimeOffset.UtcNow.AddDays(-30) },
        ], ct);

        _logger.LogInformation(
            "Seed complete — 1 admin, 4 customers, 6 vendors, 2 pending vendors, 8 bookings, 3 conversations, 2 reviews, 10 notifications.");
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static string NewId() => ObjectId.GenerateNewId().ToString();
    private static string Ago(int days)   => DateTimeOffset.UtcNow.AddDays(-days).ToString("yyyy-MM-dd");
    private static string Ahead(int days) => DateTimeOffset.UtcNow.AddDays(days).ToString("yyyy-MM-dd");

    private static List<AvailabilitySlot> AvailabilityFor(int futureDays)
    {
        var slots = new List<AvailabilitySlot>();
        for (int i = 1; i <= futureDays; i++)
        {
            var date = DateTimeOffset.UtcNow.AddDays(i);
            if (date.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
            {
                slots.Add(new AvailabilitySlot
                {
                    Date = date.ToString("yyyy-MM-dd"),
                    TimeSlots =
                    [
                        new TimeSlot { StartTime = "08:00", EndTime = "12:00" },
                        new TimeSlot { StartTime = "14:00", EndTime = "20:00" },
                    ]
                });
            }
        }
        return slots;
    }

    private static async Task EnsureIndexesAsync(
        IMongoCollection<User> users,
        IMongoCollection<Conversation> conversations,
        CancellationToken ct)
    {
        await users.Indexes.CreateOneAsync(
            new CreateIndexModel<User>(
                Builders<User>.IndexKeys.Ascending(u => u.Email),
                new CreateIndexOptions { Unique = true, Name = "ux_users_email" }),
            cancellationToken: ct);

        await conversations.Indexes.CreateOneAsync(
            new CreateIndexModel<Conversation>(
                Builders<Conversation>.IndexKeys.Ascending(c => c.CustomerId).Ascending(c => c.VendorId),
                new CreateIndexOptions { Unique = true, Name = "ux_conversations_participants" }),
            cancellationToken: ct);
    }

    private static async Task<User> UpsertUserAsync(IMongoCollection<User> col, User seed, CancellationToken ct)
    {
        var email = (seed.Email ?? string.Empty).Trim().ToLowerInvariant();
        var existing = await col.Find(u => u.Email == email).FirstOrDefaultAsync(ct);
        if (existing is not null) return existing;

        seed.Id        = string.IsNullOrWhiteSpace(seed.Id) ? NewId() : seed.Id;
        seed.Email     = email;
        seed.CreatedAt = DateTimeOffset.UtcNow;
        seed.UpdatedAt = DateTimeOffset.UtcNow;
        await col.InsertOneAsync(seed, cancellationToken: ct);
        return seed;
    }

    private static async Task<Booking> UpsertBookingAsync(IMongoCollection<Booking> col, Booking seed, CancellationToken ct)
    {
        var existing = await col
            .Find(b => b.CustomerId == seed.CustomerId && b.VendorId == seed.VendorId && b.EventDate == seed.EventDate)
            .FirstOrDefaultAsync(ct);
        if (existing is not null) return existing;

        await col.InsertOneAsync(seed, cancellationToken: ct);
        return seed;
    }

    private static async Task<Conversation> UpsertConversationAsync(IMongoCollection<Conversation> col, Conversation seed, CancellationToken ct)
    {
        var existing = await col
            .Find(c => c.CustomerId == seed.CustomerId && c.VendorId == seed.VendorId)
            .FirstOrDefaultAsync(ct);
        if (existing is not null) return existing;

        await col.InsertOneAsync(seed, cancellationToken: ct);
        return seed;
    }

    private static async Task UpsertMessagesAsync(
        IMongoCollection<BookingMessage> col,
        string convId,
        List<(string senderId, string senderName, string receiverId, string content, DateTimeOffset timestamp)> msgs,
        CancellationToken ct)
    {
        var count = await col.CountDocumentsAsync(m => m.ConversationId == convId, cancellationToken: ct);
        if (count > 0) return;

        var docs = msgs.Select(m => new BookingMessage
        {
            Id             = NewId(),
            ConversationId = convId,
            SenderId       = m.senderId,
            SenderName     = m.senderName,
            ReceiverId     = m.receiverId,
            Content        = m.content,
            Timestamp      = m.timestamp,
            Read           = true,
        }).ToList();

        await col.InsertManyAsync(docs, cancellationToken: ct);
    }

    private static async Task UpsertReviewAsync(IMongoCollection<Review> col, Review seed, CancellationToken ct)
    {
        var existing = await col.Find(r => r.BookingId == seed.BookingId).FirstOrDefaultAsync(ct);
        if (existing is not null) return;

        await col.InsertOneAsync(seed, cancellationToken: ct);
    }

    private static async Task UpsertNotificationsAsync(IMongoCollection<Notification> col, List<Notification> seeds, CancellationToken ct)
    {
        foreach (var n in seeds)
        {
            // Deduplicate by (UserId, Type, RelatedBookingId) so re-runs don't add duplicates.
            var filter = Builders<Notification>.Filter.And(
                Builders<Notification>.Filter.Eq(x => x.UserId, n.UserId),
                Builders<Notification>.Filter.Eq(x => x.Type, n.Type),
                Builders<Notification>.Filter.Eq(x => x.RelatedBookingId, n.RelatedBookingId));

            var existing = await col.Find(filter).FirstOrDefaultAsync(ct);
            if (existing is not null) continue;

            await col.InsertOneAsync(n, cancellationToken: ct);
        }
    }
}
