using System.Text.Json.Serialization;
using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Activities.Contracts;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ParticipantStatus
{
    Invited,
    Accepted,
    Declined,
}
