using System.Security.Claims;
using Eventora.Application.Abstractions.Persistence;
using Eventora.Application.Contracts.Users;
using Eventora.Domain.Users;

namespace Eventora.Api.Endpoints;

internal static class VendorsEndpoints
{
    public static void MapVendorEndpoints(this WebApplication app)
    {
        // Public vendor listing
        var vendors = app.MapGroup("/api/vendors").WithTags("Vendors");

        vendors.MapGet("", async (string? search, string? category, string? location, IUserRepository users, CancellationToken ct) =>
        {
            var all = await users.FindVendorsAsync(approvedOnly: true, ct);

            var query = all.AsEnumerable();
            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLowerInvariant();
                query = query.Where(v =>
                    (v.BusinessName ?? "").ToLowerInvariant().Contains(s) ||
                    v.FullName.ToLowerInvariant().Contains(s) ||
                    (v.Description ?? "").ToLowerInvariant().Contains(s));
            }

            if (!string.IsNullOrWhiteSpace(category) && category.Trim().ToLowerInvariant() != "all")
            {
                var c = category.Trim().ToLowerInvariant();
                query = query.Where(v => (v.Category ?? "").Trim().ToLowerInvariant() == c);
            }

            if (!string.IsNullOrWhiteSpace(location))
            {
                var l = location.Trim().ToLowerInvariant();
                query = query.Where(v => (v.Location ?? "").Trim().ToLowerInvariant().Contains(l));
            }

            return Results.Ok(query.Select(UserDtoMapping.ToDto));
        });

        vendors.MapGet("/{id}", async (string id, IUserRepository users, CancellationToken ct) =>
        {
            var vendor = await users.GetByIdAsync(id, ct);
            if (vendor is null || vendor.Role != UserRole.Vendor) return Results.NotFound(new { message = "Vendor not found" });
            if (!vendor.Approved) return Results.NotFound(new { message = "Vendor not found" });

            return Results.Ok(UserDtoMapping.ToDto(vendor));
        });

        // Vendor self endpoints
        var me = vendors.MapGroup("/me").RequireAuthorization("VendorOnly");

        me.MapGet("", async (ClaimsPrincipal principal, IUserRepository users, CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();

            var user = await users.GetByIdAsync(userId, ct);
            if (user is null || user.Role != UserRole.Vendor) return Results.NotFound(new { message = "Vendor not found" });

            return Results.Ok(UserDtoMapping.ToDto(user));
        });

        // Admin approvals
        var admin = app.MapGroup("/api/admin/vendors").WithTags("Admin").RequireAuthorization("AdminOnly");

        admin.MapGet("/pending", async (IUserRepository users, CancellationToken ct) =>
        {
            var allVendors = await users.FindVendorsAsync(approvedOnly: false, ct);
            var pending = allVendors.Where(v => v.Role == UserRole.Vendor && !v.Approved && v.RejectedAt is null);
            return Results.Ok(pending.Select(UserDtoMapping.ToDto));
        });

        admin.MapPost("/{id}/approve", async (string id, IUserRepository users, INotificationRepository notifications, CancellationToken ct) =>
        {
            var vendor = await users.GetByIdAsync(id, ct);
            if (vendor is null || vendor.Role != UserRole.Vendor) return Results.NotFound(new { message = "Vendor not found" });

            vendor.Approved = true;
            vendor.ApprovedAt = DateTimeOffset.UtcNow;
            vendor.RejectedAt = null;
            vendor.RejectionReason = null;
            await users.UpdateAsync(vendor, ct);

            await NotificationHelpers.CreateAsync(
                notifications,
                vendor.Id,
                Eventora.Domain.Notifications.NotificationType.VendorApproved,
                "Vendor account approved",
                "Your vendor account has been approved by an admin.",
                relatedBookingId: null,
                relatedDisputeId: null,
                ct);

            return Results.Ok(UserDtoMapping.ToDto(vendor));
        });

        admin.MapPost("/{id}/reject", async (string id, RejectVendorRequest req, IUserRepository users, INotificationRepository notifications, CancellationToken ct) =>
        {
            var vendor = await users.GetByIdAsync(id, ct);
            if (vendor is null || vendor.Role != UserRole.Vendor) return Results.NotFound(new { message = "Vendor not found" });

            vendor.Approved = false;
            vendor.RejectedAt = DateTimeOffset.UtcNow;
            vendor.RejectionReason = string.IsNullOrWhiteSpace(req.Reason) ? "Rejected by admin" : req.Reason.Trim();
            await users.UpdateAsync(vendor, ct);

            await NotificationHelpers.CreateAsync(
                notifications,
                vendor.Id,
                Eventora.Domain.Notifications.NotificationType.VendorRejected,
                "Vendor account rejected",
                vendor.RejectionReason,
                relatedBookingId: null,
                relatedDisputeId: null,
                ct);

            return Results.Ok(UserDtoMapping.ToDto(vendor));
        });
    }
}

public sealed record RejectVendorRequest(string? Reason);
