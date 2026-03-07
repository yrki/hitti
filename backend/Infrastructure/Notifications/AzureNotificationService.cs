using Azure.Communication.Email;
using Azure.Communication.Sms;
using Microsoft.Extensions.Options;

namespace Api.Infrastructure.Notifications;

public sealed class AzureNotificationService(
    IOptions<AzureCommunicationOptions> options,
    ILogger<AzureNotificationService> logger) : INotificationService
{
    private readonly AzureCommunicationOptions _options = options.Value;

    public async Task SendSmsAsync(string phoneNumber, string message, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Sending SMS to {PhoneNumber}", phoneNumber);

        var client = new SmsClient(_options.ConnectionString);
        var response = await client.SendAsync(_options.SmsFromNumber, phoneNumber, message, cancellationToken: cancellationToken);

        if (response.Value.Successful)
        {
            logger.LogInformation("SMS sent successfully to {PhoneNumber}", phoneNumber);
        }
        else
        {
            logger.LogError("Failed to send SMS to {PhoneNumber}: {ErrorMessage}", phoneNumber, response.Value.ErrorMessage);
            throw new InvalidOperationException($"Kunne ikke sende SMS: {response.Value.ErrorMessage}");
        }
    }

    public async Task SendEmailAsync(string toAddress, string toName, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Sending email to {Email}", toAddress);

        var client = new EmailClient(_options.ConnectionString);
        var emailMessage = new EmailMessage(
            senderAddress: _options.EmailFromAddress,
            content: new EmailContent(subject) { Html = htmlBody },
            recipients: new EmailRecipients([new EmailAddress(toAddress, toName)]));

        var operation = await client.SendAsync(Azure.WaitUntil.Started, emailMessage, cancellationToken);

        if (operation.HasValue && operation.Value.Status == EmailSendStatus.Failed)
        {
            logger.LogError("Failed to send email to {Email}: status {Status}", toAddress, operation.Value.Status);
            throw new InvalidOperationException($"Kunne ikke sende e-post til {toAddress}");
        }

        logger.LogInformation("Email queued successfully to {Email}, operation id: {OperationId}", toAddress, operation.Id);
    }
}
