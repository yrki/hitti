namespace Api.Infrastructure.Notifications;

public interface INotificationService
{
    Task SendSmsAsync(string phoneNumber, string message, CancellationToken cancellationToken = default);
    Task SendEmailAsync(string toAddress, string toName, string subject, string htmlBody, CancellationToken cancellationToken = default);
}
