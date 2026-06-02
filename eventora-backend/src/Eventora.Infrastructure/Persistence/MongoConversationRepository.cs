using Eventora.Application.Abstractions.Persistence;
using Eventora.Domain.Messaging;
using MongoDB.Driver;

namespace Eventora.Infrastructure.Persistence;

/// <summary>
/// MongoDB implementation for conversation persistence.
/// </summary>
internal sealed class MongoConversationRepository(MongoCollections collections) : IConversationRepository
{
    private readonly IMongoCollection<Conversation> _conversations = collections.Conversations;

    public async Task<Conversation?> GetByIdAsync(string id, CancellationToken ct)
    {
        return await _conversations.Find(c => c.Id == id).FirstOrDefaultAsync(ct);
    }

    public async Task<Conversation?> GetByParticipantsAsync(string customerId, string vendorId, CancellationToken ct)
    {
        return await _conversations
            .Find(c => c.CustomerId == customerId && c.VendorId == vendorId)
            .FirstOrDefaultAsync(ct);
    }

    public async Task<IReadOnlyList<Conversation>> GetForUserAsync(string userId, string role, CancellationToken ct)
    {
        FilterDefinition<Conversation> filter = role.Trim().ToLowerInvariant() switch
        {
            "customer" => Builders<Conversation>.Filter.Eq(c => c.CustomerId, userId),
            "vendor" => Builders<Conversation>.Filter.Eq(c => c.VendorId, userId),
            _ => Builders<Conversation>.Filter.Or(
                Builders<Conversation>.Filter.Eq(c => c.CustomerId, userId),
                Builders<Conversation>.Filter.Eq(c => c.VendorId, userId))
        };

        return await _conversations
            .Find(filter)
            .SortByDescending(c => c.LastMessageTime)
            .ToListAsync(ct);
    }

    public async Task CreateAsync(Conversation conversation, CancellationToken ct)
    {
        MongoId.EnsureId(conversation, c => c.Id, (c, v) => c.Id = v);
        conversation.CreatedAt = DateTimeOffset.UtcNow;
        conversation.UpdatedAt = DateTimeOffset.UtcNow;
        await _conversations.InsertOneAsync(conversation, cancellationToken: ct);
    }

    public async Task UpdateAsync(Conversation conversation, CancellationToken ct)
    {
        conversation.UpdatedAt = DateTimeOffset.UtcNow;
        await _conversations.ReplaceOneAsync(c => c.Id == conversation.Id, conversation, cancellationToken: ct);
    }
}
