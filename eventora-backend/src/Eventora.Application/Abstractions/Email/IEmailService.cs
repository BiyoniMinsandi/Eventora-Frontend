namespace Eventora.Application.Abstractions.Email;

/// <summary>
/// Sends transactional emails. Implementation may be SMTP or a no-op stub when not configured.
/// </summary>
public interface IEmailService
{
    Task SendAsync(string toEmail, string toName, string subject, string htmlBody, CancellationToken ct = default);
}
