using Eventora.Application.Abstractions.Persistence;
using Eventora.Domain.Disputes;
using MongoDB.Driver;

namespace Eventora.Infrastructure.Persistence;

internal sealed class MongoDisputeMessageRepository(MongoCollections collections) : IDisputeMessageRepository
{
    private readonly IMongoCollection<DisputeMessage> _messages = collections.DisputeMessages;

    public async Task<IReadOnlyList<DisputeMessage>> GetForDisputeAsync(string disputeId, CancellationToken ct)
    {
        return await _messages
            .Find(m => m.DisputeId == disputeId)
            .SortBy(m => m.Timestamp)
            .ToListAsync(ct);
    }

    public async Task CreateAsync(DisputeMessage message, CancellationToken ct)
    {
        MongoId.EnsureId(message, m => m.Id, (m, v) => m.Id = v);
        message.Timestamp = DateTimeOffset.UtcNow;
        await _messages.InsertOneAsync(message, cancellationToken: ct);
    }
}
