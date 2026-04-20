using Eventora.Domain.Messaging;

namespace Eventora.Application.Abstractions.Persistence;

/// <summary>
/// Persistence for booking-linked message threads.
/// </summary>
public interface IConversationRepository
{
    Task<Conversation?> GetByIdAsync(string id, CancellationToken ct);

    /// <summary>
    /// Fallback lookup by participant pair for legacy/admin-created conversations
    /// that predate the BookingId field.
    /// </summary>
    Task<Conversation?> GetByParticipantsAsync(string customerId, string vendorId, CancellationToken ct);

    /// <summary>
    /// Primary lookup path — each accepted booking has at most one conversation.
    /// </summary>
    Task<Conversation?> GetByBookingIdAsync(string bookingId, CancellationToken ct);

    Task<IReadOnlyList<Conversation>> GetForUserAsync(string userId, string role, CancellationToken ct);
    Task CreateAsync(Conversation conversation, CancellationToken ct);
    Task UpdateAsync(Conversation conversation, CancellationToken ct);
}
