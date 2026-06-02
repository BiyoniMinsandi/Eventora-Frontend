namespace Eventora.Domain.Notifications;

/// <summary>
/// Notification types mirrored from the frontend.
/// </summary>
public enum NotificationType
{
    BookingRequest = 0,
    BookingAccepted = 1,
    BookingRejected = 2,
    BookingCompleted = 3,
    ReviewPrompt = 4,
    DisputeUpdate = 5,
    Message = 6,
    VendorApproved = 7,
    VendorRejected = 8,
}

public static class NotificationTypeMapping
{
    public static bool TryParse(string value, out NotificationType type)
    {
        type = NotificationType.Message;
        if (string.IsNullOrWhiteSpace(value)) return false;

        return value.Trim().ToLowerInvariant() switch
        {
            "booking_request" => (type = NotificationType.BookingRequest) == NotificationType.BookingRequest,
            "booking_accepted" => (type = NotificationType.BookingAccepted) == NotificationType.BookingAccepted,
            "booking_rejected" => (type = NotificationType.BookingRejected) == NotificationType.BookingRejected,
            "booking_completed" => (type = NotificationType.BookingCompleted) == NotificationType.BookingCompleted,
            "review_prompt" => (type = NotificationType.ReviewPrompt) == NotificationType.ReviewPrompt,
            "dispute_update" => (type = NotificationType.DisputeUpdate) == NotificationType.DisputeUpdate,
            "message" => (type = NotificationType.Message) == NotificationType.Message,
            "vendor_approved" => (type = NotificationType.VendorApproved) == NotificationType.VendorApproved,
            "vendor_rejected" => (type = NotificationType.VendorRejected) == NotificationType.VendorRejected,
            _ => false,
        };
    }

    public static string ToApiString(NotificationType type) => type switch
    {
        NotificationType.BookingRequest => "booking_request",
        NotificationType.BookingAccepted => "booking_accepted",
        NotificationType.BookingRejected => "booking_rejected",
        NotificationType.BookingCompleted => "booking_completed",
        NotificationType.ReviewPrompt => "review_prompt",
        NotificationType.DisputeUpdate => "dispute_update",
        NotificationType.Message => "message",
        NotificationType.VendorApproved => "vendor_approved",
        NotificationType.VendorRejected => "vendor_rejected",
        _ => "message",
    };
}
