using Eventora.Application.Abstractions.Persistence;
using Eventora.Domain.Bookings;
using MongoDB.Driver;

namespace Eventora.Infrastructure.Persistence;

/// <summary>
/// MongoDB implementation for booking persistence.
/// </summary>
internal sealed class MongoBookingRepository(MongoCollections collections) : IBookingRepository
{
    private readonly IMongoCollection<Booking> _bookings = collections.Bookings;

    public async Task<Booking?> GetByIdAsync(string id, CancellationToken ct)
    {
        return await _bookings.Find(b => b.Id == id).FirstOrDefaultAsync(ct);
    }

    public async Task<IReadOnlyList<Booking>> GetForCustomerAsync(string customerId, CancellationToken ct)
    {
        return await _bookings
            .Find(b => b.CustomerId == customerId)
            .SortByDescending(b => b.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Booking>> GetForVendorAsync(string vendorId, CancellationToken ct)
    {
        return await _bookings
            .Find(b => b.VendorId == vendorId)
            .SortByDescending(b => b.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Booking>> GetAllAsync(CancellationToken ct)
    {
        return await _bookings
            .Find(_ => true)
            .SortByDescending(b => b.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task CreateAsync(Booking booking, CancellationToken ct)
    {
        MongoId.EnsureId(booking, b => b.Id, (b, v) => b.Id = v);
        booking.CreatedAt = DateTimeOffset.UtcNow;
        booking.UpdatedAt = DateTimeOffset.UtcNow;
        await _bookings.InsertOneAsync(booking, cancellationToken: ct);
    }

    public async Task UpdateAsync(Booking booking, CancellationToken ct)
    {
        booking.UpdatedAt = DateTimeOffset.UtcNow;
        await _bookings.ReplaceOneAsync(b => b.Id == booking.Id, booking, cancellationToken: ct);
    }
}
