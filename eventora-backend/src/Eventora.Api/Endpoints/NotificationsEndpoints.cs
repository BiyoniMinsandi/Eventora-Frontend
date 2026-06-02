using System.Security.Claims;
using Eventora.Application.Abstractions.Persistence;
using Eventora.Application.Contracts.Notifications;

namespace Eventora.Api.Endpoints;

internal static class NotificationsEndpoints
{
    public static void MapNotificationsEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/notifications").WithTags("Notifications").RequireAuthorization();

        group.MapGet("", async (ClaimsPrincipal principal, INotificationRepository notifications, CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();

            var list = await notifications.GetForUserAsync(userId, ct);
            return Results.Ok(list.Select(NotificationDtoMapping.ToDto));
        });

        group.MapPost("/{id}/read", async (string id, ClaimsPrincipal principal, INotificationRepository notifications, CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();

            await notifications.MarkReadAsync(id, userId, ct);
            return Results.Ok(new { success = true });
        });

        group.MapPost("/read-all", async (ClaimsPrincipal principal, INotificationRepository notifications, CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();

            await notifications.MarkAllReadAsync(userId, ct);
            return Results.Ok(new { success = true });
        });
    }
}
