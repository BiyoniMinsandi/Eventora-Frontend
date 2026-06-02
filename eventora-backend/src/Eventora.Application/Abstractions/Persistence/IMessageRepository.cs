using Eventora.Domain.Messaging;

namespace Eventora.Application.Abstractions.Persistence;

/// <summary>
/// Message persistence operations.
/// </summary>
public interface IMessageRepository
{
    Task<IReadOnlyList<BookingMessage>> GetForConversationAsync(string conversationId, CancellationToken ct);
    Task<int> CountUnreadAsync(string conversationId, string receiverId, CancellationToken ct);
    Task CreateAsync(BookingMessage message, CancellationToken ct);
    Task MarkConversationReadAsync(string conversationId, string receiverId, CancellationToken ct);
}
