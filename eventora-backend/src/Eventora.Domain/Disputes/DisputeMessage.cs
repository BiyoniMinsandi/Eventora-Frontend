using Eventora.Domain.Common;

namespace Eventora.Domain.Disputes;

/// <summary>
/// A single message within an admin-mediated dispute thread.
/// All three parties (customer, vendor, admin) can post messages here.
/// Messages cannot be sent once the dispute is Resolved or Closed.
/// </summary>
public sealed class DisputeMessage : EntityBase
{
    public string DisputeId { get; set; } = string.Empty;

    public string SenderId { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;

    /// <summary>
    /// Denormalised role string ("customer" | "vendor" | "admin") so the UI
    /// can style messages by role without an extra user lookup.
    /// </summary>
    public string SenderRole { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;
}
