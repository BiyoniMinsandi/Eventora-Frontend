using System.ComponentModel.DataAnnotations;

namespace Eventora.Application.Contracts.Messaging;

public sealed record ConversationDto(
    string Id,
    string CustomerId,
    string CustomerName,
    string VendorId,
    string VendorName,
    string LastMessage,
    string LastMessageTime,
    int UnreadCount);

public sealed record MessageDto(
    string Id,
    string ConversationId,
    string SenderId,
    string SenderName,
    string ReceiverId,
    string Content,
    string Timestamp,
    bool Read);

public sealed record GetOrCreateConversationRequest(
    [property: Required] string CustomerId,
    [property: Required] string CustomerName,
    [property: Required] string VendorId,
    [property: Required] string VendorName);

public sealed record SendMessageRequest(
    [property: Required] string ReceiverId,
    [property: Required, MinLength(1)] string Content);
