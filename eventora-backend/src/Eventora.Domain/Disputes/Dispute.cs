using Eventora.Domain.Common;

namespace Eventora.Domain.Disputes;

public sealed class Dispute : EntityBase
{
    public string BookingId { get; set; } = string.Empty;

    public string CustomerId { get; set; } = string.Empty;

    public string CustomerName { get; set; } = string.Empty;

    public string VendorId { get; set; } = string.Empty;

    public string VendorName { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DisputeCategory Category { get; set; }

    public List<string> Evidence { get; set; } = [];

    public DisputeStatus Status { get; set; } = DisputeStatus.Open;

    public DisputePriority Priority { get; set; } = DisputePriority.Medium;

    public string? Resolution { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
