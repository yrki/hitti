namespace Api.Features.Settings.Contracts;

public sealed record UpdateSettingsRequest
{
    public required string OrganizationName { get; init; }
    public required string Email { get; init; }
    public required string Phone { get; init; }
}
