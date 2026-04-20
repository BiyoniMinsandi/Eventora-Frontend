using Eventora.Domain.Disputes;

namespace Eventora.Application.Abstractions.Persistence;

/// <summary>
/// Persistence for the structured message thread inside a dispute.
/// Messages are ordered by timestamp and stored indefinitely for audit purposes (SRS §4.7).
/// </summary>
public interface IDisputeMessageRepository
{
    Task<IReadOnlyList<DisputeMessage>> GetForDisputeAsync(string disputeId, CancellationToken ct);
    Task CreateAsync(DisputeMessage message, CancellationToken ct);
}
