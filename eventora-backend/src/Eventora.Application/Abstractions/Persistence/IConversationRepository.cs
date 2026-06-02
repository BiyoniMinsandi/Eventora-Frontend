using Eventora.Domain.Messaging;

namespace Eventora.Application.Abstractions.Persistence;

/// <summary>
/// Conversation persistence operations.
/// </summary>
public interface IConversationRepository
{
    Task<Conversation?> GetByIdAsync(string id, CancellationToken ct);
    Task<Conversation?> GetByParticipantsAsync(string customerId, string vendorId, CancellationToken ct);
    Task<IReadOnlyList<Conversation>> GetForUserAsync(string userId, string role, CancellationToken ct);
    Task CreateAsync(Conversation conversation, CancellationToken ct);
    Task UpdateAsync(Conversation conversation, CancellationToken ct);
}
