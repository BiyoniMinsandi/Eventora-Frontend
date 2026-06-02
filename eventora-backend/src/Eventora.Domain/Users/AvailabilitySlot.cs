namespace Eventora.Domain.Users;

/// <summary>
/// Vendor availability for a given date with optional time slots.
/// </summary>
public sealed class AvailabilitySlot
{
    /// <summary>
    /// ISO date string (YYYY-MM-DD).
    /// </summary>
    public string Date { get; set; } = string.Empty;

    public List<TimeSlot> TimeSlots { get; set; } = [];
}

public sealed class TimeSlot
{
    /// <summary>
    /// HH:mm string.
    /// </summary>
    public string StartTime { get; set; } = string.Empty;

    /// <summary>
    /// HH:mm string.
    /// </summary>
    public string EndTime { get; set; } = string.Empty;
}
