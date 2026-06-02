using Eventora.Domain.Common;

namespace Eventora.Domain.Reviews;

public sealed class Review : EntityBase
{
    public string BookingId { get; set; } = string.Empty;

    public string CustomerId { get; set; } = string.Empty;

    public string CustomerName { get; set; } = string.Empty;

    public string VendorId { get; set; } = string.Empty;

    public int Rating { get; set; }

    public string Comment { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
