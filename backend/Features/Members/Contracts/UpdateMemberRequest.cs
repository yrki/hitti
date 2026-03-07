namespace Api.Features.Members.Contracts;

public sealed record UpdateMemberRequest
{
    public required string Name { get; init; }
    public required string Email { get; init; }
    public required string Phone { get; init; }
    public required string Status { get; init; }
    public required DateTime JoinedAt { get; init; }
}
