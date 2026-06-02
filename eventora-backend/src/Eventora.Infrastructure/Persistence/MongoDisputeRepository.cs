using Eventora.Application.Abstractions.Persistence;
using Eventora.Domain.Disputes;
using MongoDB.Driver;

namespace Eventora.Infrastructure.Persistence;

/// <summary>
/// MongoDB implementation for disputes.
/// </summary>
internal sealed class MongoDisputeRepository(MongoCollections collections) : IDisputeRepository
{
    private readonly IMongoCollection<Dispute> _disputes = collections.Disputes;

    public async Task<Dispute?> GetByIdAsync(string id, CancellationToken ct)
    {
        return await _disputes.Find(d => d.Id == id).FirstOrDefaultAsync(ct);
    }

    public async Task<Dispute?> GetByBookingIdAsync(string bookingId, CancellationToken ct)
    {
        return await _disputes.Find(d => d.BookingId == bookingId).FirstOrDefaultAsync(ct);
    }

    public async Task<IReadOnlyList<Dispute>> GetForCustomerAsync(string customerId, CancellationToken ct)
    {
        return await _disputes
            .Find(d => d.CustomerId == customerId)
            .SortByDescending(d => d.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Dispute>> GetForVendorAsync(string vendorId, CancellationToken ct)
    {
        return await _disputes
            .Find(d => d.VendorId == vendorId)
            .SortByDescending(d => d.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Dispute>> GetAllAsync(CancellationToken ct)
    {
        return await _disputes
            .Find(FilterDefinition<Dispute>.Empty)
            .SortByDescending(d => d.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task CreateAsync(Dispute dispute, CancellationToken ct)
    {
        MongoId.EnsureId(dispute, d => d.Id, (d, v) => d.Id = v);
        dispute.CreatedAt = DateTimeOffset.UtcNow;
        dispute.UpdatedAt = DateTimeOffset.UtcNow;
        await _disputes.InsertOneAsync(dispute, cancellationToken: ct);
    }

    public async Task UpdateAsync(Dispute dispute, CancellationToken ct)
    {
        dispute.UpdatedAt = DateTimeOffset.UtcNow;
        await _disputes.ReplaceOneAsync(d => d.Id == dispute.Id, dispute, cancellationToken: ct);
    }
}
