using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Auth.Contracts;

[ExcludeFromCodeCoverage]
public sealed record LoginRequest
{
    public required string Email { get; init; }
    public required string Password { get; init; }
}
