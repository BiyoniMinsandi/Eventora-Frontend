using Eventora.Domain.Disputes;

namespace Eventora.Application.Abstractions.Persistence;

/// <summary>
/// Dispute persistence operations.
/// </summary>
public interface IDisputeRepository
{
    Task<Dispute?> GetByIdAsync(string id, CancellationToken ct);
    Task<Dispute?> GetByBookingIdAsync(string bookingId, CancellationToken ct);
    Task<IReadOnlyList<Dispute>> GetForCustomerAsync(string customerId, CancellationToken ct);
    Task<IReadOnlyList<Dispute>> GetForVendorAsync(string vendorId, CancellationToken ct);
    Task<IReadOnlyList<Dispute>> GetAllAsync(CancellationToken ct);
    Task CreateAsync(Dispute dispute, CancellationToken ct);
    Task UpdateAsync(Dispute dispute, CancellationToken ct);
}
