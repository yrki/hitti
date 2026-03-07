using System.Text.Json.Serialization;

namespace Api.Features.Activities.Contracts;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum NotificationStatus
{
    Pending,
    Sent,
    Failed,
}
