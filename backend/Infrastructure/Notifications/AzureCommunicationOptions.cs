using System.Diagnostics.CodeAnalysis;

namespace Api.Infrastructure.Notifications;

[ExcludeFromCodeCoverage]
public sealed class AzureCommunicationOptions
{
    public required string ConnectionString { get; set; }
    public required string SmsFromNumber { get; set; }
    public required string EmailFromAddress { get; set; }
}
