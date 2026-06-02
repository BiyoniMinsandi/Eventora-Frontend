using Eventora.Domain.Common;

namespace Eventora.Domain.Users;

/// <summary>
/// System user. Vendors are represented as users with role = Vendor.
/// </summary>
public sealed class User : EntityBase
{
    public string Email { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public string PasswordHash { get; set; } = string.Empty;

    public string? Phone { get; set; }

    // Vendor fields
    public string? BusinessName { get; set; }

    public string? Category { get; set; }

    public string? Location { get; set; }

    public string? Description { get; set; }

    public List<string> Photos { get; set; } = [];

    public List<string> Services { get; set; } = [];

    public string? Pricing { get; set; }

    public string? Experience { get; set; }

    public bool Approved { get; set; }

    public DateTimeOffset? ApprovedAt { get; set; }

    public DateTimeOffset? RejectedAt { get; set; }

    public string? RejectionReason { get; set; }

    public List<AvailabilitySlot> Availability { get; set; } = [];

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
