using System.Diagnostics.CodeAnalysis;

namespace Api.Infrastructure.Database.Entities;

[ExcludeFromCodeCoverage]
public sealed class OrganizationEntity
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string Phone { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<MemberEntity> Members { get; set; } = [];
}
