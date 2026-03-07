namespace Api.Features.Auth.Contracts;

public sealed record TokenResponse
{
    public required string Token { get; init; }
    public required UserResponse User { get; init; }
}
