using System.ComponentModel.DataAnnotations;

namespace Eventora.Application.Contracts.Disputes;

public sealed record CreateDisputeRequest(
    [property: Required] string BookingId,
    [property: Required, MinLength(2)] string Title,
    [property: Required, MinLength(5)] string Description,
    [property: Required] string Category,
    List<string>? Evidence);

public sealed record UpdateDisputeRequest(
    string? Status,
    string? Priority,
    string? Resolution);

public sealed record DisputeDto(
    string Id,
    string BookingId,
    string CustomerId,
    string CustomerName,
    string VendorId,
    string VendorName,
    string Title,
    string Description,
    string Category,
    List<string> Evidence,
    string Status,
    string Priority,
    string? Resolution,
    string CreatedAt,
    string UpdatedAt);

public static class DisputeDtoMapping
{
    public static DisputeDto ToDto(Eventora.Domain.Disputes.Dispute dispute)
    {
        return new DisputeDto(
            dispute.Id,
            dispute.BookingId,
            dispute.CustomerId,
            dispute.CustomerName,
            dispute.VendorId,
            dispute.VendorName,
            dispute.Title,
            dispute.Description,
            dispute.Category.ToString().ToLowerInvariant(),
            dispute.Evidence ?? [],
            dispute.Status.ToString().ToLowerInvariant().Replace("inreview", "in-review"),
            dispute.Priority.ToString().ToLowerInvariant(),
            dispute.Resolution,
            dispute.CreatedAt.ToString("O"),
            dispute.UpdatedAt.ToString("O"));
    }
}
