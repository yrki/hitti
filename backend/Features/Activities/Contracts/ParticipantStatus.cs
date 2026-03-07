using System.Text.Json.Serialization;

namespace Api.Features.Activities.Contracts;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ParticipantStatus
{
    Invited,
    Accepted,
    Declined,
}
