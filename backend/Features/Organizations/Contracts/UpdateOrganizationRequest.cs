namespace Api.Features.Organizations.Contracts;

public sealed record UpdateOrganizationRequest
{
    public required string Name { get; init; }
    public required string Email { get; init; }
    public required string Phone { get; init; }
}
