using System.ComponentModel.DataAnnotations;
using Eventora.Domain.Disputes;

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

public sealed record SendDisputeMessageRequest(
    [property: Required, MinLength(1)] string Content);

public sealed record DisputeMessageDto(
    string Id,
    string DisputeId,
    string SenderId,
    string SenderName,
    string SenderRole,
    string Content,
    string Timestamp);

public static class DisputeMessageDtoMapping
{
    public static DisputeMessageDto ToDto(DisputeMessage m) =>
        new(m.Id, m.DisputeId, m.SenderId, m.SenderName, m.SenderRole, m.Content, m.Timestamp.ToString("O"));
}

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
