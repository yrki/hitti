namespace Api.Features.Auth.Contracts;

public sealed record UserResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Email { get; init; }
    public required string Phone { get; init; }
    public required string Role { get; init; }
    public required OrganizationInfo Organization { get; init; }
}

public sealed record OrganizationInfo
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Email { get; init; }
    public required string Phone { get; init; }
}
