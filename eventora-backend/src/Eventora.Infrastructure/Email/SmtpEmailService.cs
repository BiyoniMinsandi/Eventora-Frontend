using System.Net;
using System.Net.Mail;
using Eventora.Application.Abstractions.Email;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Eventora.Infrastructure.Email;

/// <summary>
/// Sends email via SMTP using System.Net.Mail. Silently skips sending when
/// Email:Enabled is false or SenderEmail is empty, so dev environments never
/// need real SMTP credentials.
/// </summary>
public sealed class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration config, ILogger<SmtpEmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendAsync(string toEmail, string toName, string subject, string htmlBody, CancellationToken ct = default)
    {
        var section = _config.GetSection("Email");
        var enabled = section.GetValue<bool>("Enabled");
        var senderEmail = section["SenderEmail"] ?? string.Empty;

        if (!enabled || string.IsNullOrWhiteSpace(senderEmail))
        {
            _logger.LogDebug("Email sending skipped (Email:Enabled={Enabled}, SenderEmail configured={HasEmail})", enabled, !string.IsNullOrWhiteSpace(senderEmail));
            return;
        }

        var host = section["SmtpHost"] ?? "smtp.gmail.com";
        var port = section.GetValue<int>("SmtpPort", 587);
        var password = section["SenderPassword"] ?? string.Empty;
        var senderName = section["SenderName"] ?? "Eventora";

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(senderEmail, password),
        };

        using var message = new MailMessage
        {
            From = new MailAddress(senderEmail, senderName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true,
        };

        message.To.Add(new MailAddress(toEmail, toName));

        try
        {
            await client.SendMailAsync(message, ct);
            _logger.LogInformation("Email sent to {Email} — subject: {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send email to {Email}", toEmail);
        }
    }
}
