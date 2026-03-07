namespace Api.Features.Settings.Contracts;

public sealed record SettingsResponse
{
    public required Guid Id { get; init; }
    public required string OrganizationName { get; init; }
    public required string Email { get; init; }
    public required string Phone { get; init; }
}
