using Eventora.Domain.Common;

namespace Eventora.Domain.Messaging;

/// <summary>
/// A message thread between a customer and a vendor, scoped to a specific booking.
/// A conversation is created automatically when a vendor accepts a booking.
/// Per SRS §4.5, messaging is only permitted while the booking is Accepted or Completed.
/// </summary>
public sealed class Conversation : EntityBase
{
    public string CustomerId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;

    public string VendorId { get; set; } = string.Empty;
    public string VendorName { get; set; } = string.Empty;

    /// <summary>
    /// Links the conversation to its booking. Null only for legacy/admin-created threads.
    /// The send-message endpoint checks this booking's status before allowing new messages.
    /// </summary>
    public string? BookingId { get; set; }

    /// <summary>Cached preview of the most recent message for the conversation list.</summary>
    public string LastMessage { get; set; } = "No messages yet";

    public DateTimeOffset LastMessageTime { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
