using System.ComponentModel.DataAnnotations;

namespace Eventora.Application.Contracts.Reviews;

public sealed record CreateReviewRequest(
    [property: Required] string BookingId,
    [property: Range(1, 5)] int Rating,
    [property: Required, MinLength(2)] string Comment);

public sealed record ReviewDto(
    string Id,
    string BookingId,
    string CustomerId,
    string CustomerName,
    string VendorId,
    int Rating,
    string Comment,
    string CreatedAt);

public static class ReviewDtoMapping
{
    public static ReviewDto ToDto(Eventora.Domain.Reviews.Review review)
    {
        return new ReviewDto(
            review.Id,
            review.BookingId,
            review.CustomerId,
            review.CustomerName,
            review.VendorId,
            review.Rating,
            review.Comment,
            review.CreatedAt.ToString("O"));
    }
}
