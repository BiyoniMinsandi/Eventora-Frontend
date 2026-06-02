using Eventora.Domain.Common;

namespace Eventora.Domain.Messaging;

/// <summary>
/// A lightweight conversation between a customer and a vendor.
/// </summary>
public sealed class Conversation : EntityBase
{
    public string CustomerId { get; set; } = string.Empty;

    public string CustomerName { get; set; } = string.Empty;

    public string VendorId { get; set; } = string.Empty;

    public string VendorName { get; set; } = string.Empty;

    public string LastMessage { get; set; } = "No messages yet";

    public DateTimeOffset LastMessageTime { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
