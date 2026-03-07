namespace Api.Infrastructure.Database.Entities;

public sealed class OrganizationSettingsEntity
{
    public Guid Id { get; set; }
    public required string OrganizationName { get; set; }
    public required string Email { get; set; }
    public required string Phone { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
