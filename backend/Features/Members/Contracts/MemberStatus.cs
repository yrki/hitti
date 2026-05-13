using System.Text.Json.Serialization;
using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Members.Contracts;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MemberStatus
{
    Active,
    Inactive,
}
