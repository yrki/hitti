namespace Api.Infrastructure.Notifications;

public sealed class AzureCommunicationOptions
{
    public required string ConnectionString { get; set; }
    public required string SmsFromNumber { get; set; }
    public required string EmailFromAddress { get; set; }
}
