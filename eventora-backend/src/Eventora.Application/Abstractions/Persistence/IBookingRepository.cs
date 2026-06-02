using Eventora.Domain.Bookings;

namespace Eventora.Application.Abstractions.Persistence;

/// <summary>
/// Booking persistence operations.
/// </summary>
public interface IBookingRepository
{
    Task<Booking?> GetByIdAsync(string id, CancellationToken ct);
    Task<IReadOnlyList<Booking>> GetForCustomerAsync(string customerId, CancellationToken ct);
    Task<IReadOnlyList<Booking>> GetForVendorAsync(string vendorId, CancellationToken ct);
    Task CreateAsync(Booking booking, CancellationToken ct);
    Task UpdateAsync(Booking booking, CancellationToken ct);
}
