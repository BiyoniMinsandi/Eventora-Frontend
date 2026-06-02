using System.Security.Claims;

namespace Eventora.Api.Endpoints;

internal static class CurrentUser
{
    public static string? TryGetUserId(ClaimsPrincipal principal)
        => principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? principal.FindFirstValue("sub");

    public static string TryGetRole(ClaimsPrincipal principal)
        => principal.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
}
