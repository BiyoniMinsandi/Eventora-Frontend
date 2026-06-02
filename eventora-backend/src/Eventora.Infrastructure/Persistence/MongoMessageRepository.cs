using Eventora.Application.Abstractions.Persistence;
using Eventora.Domain.Messaging;
using MongoDB.Driver;

namespace Eventora.Infrastructure.Persistence;

/// <summary>
/// MongoDB implementation for conversation messages.
/// </summary>
internal sealed class MongoMessageRepository(MongoCollections collections) : IMessageRepository
{
    private readonly IMongoCollection<BookingMessage> _messages = collections.Messages;

    public async Task<IReadOnlyList<BookingMessage>> GetForConversationAsync(string conversationId, CancellationToken ct)
    {
        return await _messages
            .Find(m => m.ConversationId == conversationId)
            .SortBy(m => m.Timestamp)
            .ToListAsync(ct);
    }

    public async Task<int> CountUnreadAsync(string conversationId, string receiverId, CancellationToken ct)
    {
        var count = await _messages.CountDocumentsAsync(
            m => m.ConversationId == conversationId && m.ReceiverId == receiverId && !m.Read,
            cancellationToken: ct);

        return (int)count;
    }

    public async Task CreateAsync(BookingMessage message, CancellationToken ct)
    {
        MongoId.EnsureId(message, m => m.Id, (m, v) => m.Id = v);
        message.Timestamp = DateTimeOffset.UtcNow;
        await _messages.InsertOneAsync(message, cancellationToken: ct);
    }

    public async Task MarkConversationReadAsync(string conversationId, string receiverId, CancellationToken ct)
    {
        var filter = Builders<BookingMessage>.Filter.Eq(m => m.ConversationId, conversationId)
                     & Builders<BookingMessage>.Filter.Eq(m => m.ReceiverId, receiverId)
                     & Builders<BookingMessage>.Filter.Eq(m => m.Read, false);

        var update = Builders<BookingMessage>.Update.Set(m => m.Read, true);
        await _messages.UpdateManyAsync(filter, update, cancellationToken: ct);
    }
}
