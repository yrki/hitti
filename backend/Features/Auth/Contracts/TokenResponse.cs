using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Auth.Contracts;

[ExcludeFromCodeCoverage]
public sealed record TokenResponse
{
    public required string Token { get; init; }
    public required UserResponse User { get; init; }
}
