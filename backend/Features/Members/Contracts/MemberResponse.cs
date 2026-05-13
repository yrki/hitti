using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Members.Contracts;

[ExcludeFromCodeCoverage]
public sealed record MemberResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Email { get; init; }
    public required string Phone { get; init; }
    public required MemberStatus Status { get; init; }
    public required MemberRole Role { get; init; }
    public required DateTime JoinedAt { get; init; }
}
