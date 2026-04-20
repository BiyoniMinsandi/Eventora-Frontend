using System.Security.Claims;
using Eventora.Application.Abstractions.Persistence;
using Eventora.Application.Contracts.Reviews;
using Eventora.Domain.Bookings;

namespace Eventora.Api.Endpoints;

internal static class ReviewsEndpoints
{
    public static void MapReviewsEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/reviews").WithTags("Reviews");

        group.MapGet("/vendor/{vendorId}", async (string vendorId, IReviewRepository reviews, CancellationToken ct) =>
        {
            var list = await reviews.GetForVendorAsync(vendorId, ct);
            return Results.Ok(list.Select(ReviewDtoMapping.ToDto));
        });

        group.MapPost("", async (
            CreateReviewRequest req,
            ClaimsPrincipal principal,
            IUserRepository users,
            IBookingRepository bookings,
            IReviewRepository reviews,
            INotificationRepository notifications,
            CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();
            if (!principal.IsInRole("customer")) return Results.Forbid();

            var customer = await users.GetByIdAsync(userId, ct);
            if (customer is null) return Results.Unauthorized();

            var booking = await bookings.GetByIdAsync(req.BookingId, ct);
            if (booking is null) return Results.NotFound(new { message = "Booking not found" });
            if (booking.CustomerId != userId) return Results.Forbid();
            if (booking.Status != BookingStatus.Completed) return Results.BadRequest(new { message = "Booking must be completed to review" });

            var existing = await reviews.GetByBookingIdAsync(req.BookingId, ct);
            if (existing is not null) return Results.Conflict(new { message = "You already reviewed this booking" });

            var review = new Eventora.Domain.Reviews.Review
            {
                BookingId = booking.Id,
                CustomerId = customer.Id,
                CustomerName = customer.FullName,
                VendorId = booking.VendorId,
                Rating = req.Rating,
                Comment = req.Comment.Trim(),
            };

            await reviews.CreateAsync(review, ct);

            await NotificationHelpers.CreateAsync(
                notifications,
                booking.VendorId,
                Eventora.Domain.Notifications.NotificationType.ReviewPrompt,
                "New review received",
                $"{customer.FullName} left you a review.",
                relatedBookingId: booking.Id,
                relatedDisputeId: null,
                ct);

            return Results.Ok(ReviewDtoMapping.ToDto(review));
        }).RequireAuthorization("CustomerOnly");
    }
}
