namespace Api.Features.Auth.Contracts;

public sealed record LoginRequest
{
    public required string Email { get; init; }
    public required string Password { get; init; }
}
