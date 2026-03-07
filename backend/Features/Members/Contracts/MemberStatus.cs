using System.Text.Json.Serialization;

namespace Api.Features.Members.Contracts;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MemberStatus
{
    Active,
    Inactive,
}
