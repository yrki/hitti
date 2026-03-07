namespace Api.Infrastructure.Database.Entities;

public sealed class MemberEntity
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string Phone { get; set; }
    public required string Status { get; set; }
    public required string Role { get; set; }
    public string? PasswordHash { get; set; }
    public Guid OrganizationId { get; set; }
    public DateTime JoinedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public OrganizationEntity Organization { get; set; } = null!;
}
