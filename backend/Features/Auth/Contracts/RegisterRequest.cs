using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Auth.Contracts;

[ExcludeFromCodeCoverage]
public sealed record RegisterRequest
{
    public required string OrganizationName { get; init; }
    public required string OrganizationEmail { get; init; }
    public required string OrganizationPhone { get; init; }
    public required string AdminName { get; init; }
    public required string AdminEmail { get; init; }
    public required string AdminPhone { get; init; }
    public required string Password { get; init; }
}
