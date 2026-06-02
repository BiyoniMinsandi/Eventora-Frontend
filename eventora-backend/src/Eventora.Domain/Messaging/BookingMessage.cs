using Eventora.Domain.Common;

namespace Eventora.Domain.Messaging;

/// <summary>
/// Structured message linked to a booking.
/// </summary>
public sealed class BookingMessage : EntityBase
{
    public string ConversationId { get; set; } = string.Empty;

    public string SenderId { get; set; } = string.Empty;

    public string SenderName { get; set; } = string.Empty;

    public string ReceiverId { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;

    public bool Read { get; set; }
}
