using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Organizations.Contracts;

[ExcludeFromCodeCoverage]
public sealed record UpdateOrganizationResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Email { get; init; }
    public required string Phone { get; init; }
}
