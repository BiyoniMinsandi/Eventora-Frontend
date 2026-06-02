using System.Security.Claims;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace Eventora.Api.Endpoints;

/// <summary>
/// Image upload endpoint backed by Azure Blob Storage.
/// Returns the public blob URL on success.
/// If Azure is not configured (empty connection string) returns 503.
/// </summary>
internal static class UploadEndpoints
{
    public static void MapUploadEndpoints(this WebApplication app)
    {
        app.MapPost("/api/upload/image", async (
            IFormFile file,
            ClaimsPrincipal principal,
            IConfiguration config,
            CancellationToken ct) =>
        {
            var userId = CurrentUser.TryGetUserId(principal);
            if (string.IsNullOrWhiteSpace(userId)) return Results.Unauthorized();

            var connStr = config["Azure:StorageConnectionString"] ?? string.Empty;
            if (string.IsNullOrWhiteSpace(connStr))
            {
                return Results.Problem(
                    detail: "Azure Storage is not configured. Add Azure:StorageConnectionString to appsettings.",
                    statusCode: 503);
            }

            if (file.Length == 0)
                return Results.BadRequest(new { message = "File is empty" });

            if (file.Length > 10 * 1024 * 1024)
                return Results.BadRequest(new { message = "File exceeds the 10 MB limit" });

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            if (!allowed.Contains(ext))
                return Results.BadRequest(new { message = "Only JPEG, PNG, and WebP files are allowed" });

            var containerName = config["Azure:ImageContainerName"] ?? "vendor-images";
            var blobName = $"vendors/{userId}/{Guid.NewGuid()}{ext}";

            var blobClient = new BlobContainerClient(connStr, containerName);
            await blobClient.CreateIfNotExistsAsync(PublicAccessType.Blob, cancellationToken: ct);

            var blob = blobClient.GetBlobClient(blobName);
            using var stream = file.OpenReadStream();
            await blob.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType }, cancellationToken: ct);

            return Results.Ok(new { url = blob.Uri.ToString() });
        })
        .RequireAuthorization()
        .DisableAntiforgery()
        .WithTags("Upload");
    }
}
