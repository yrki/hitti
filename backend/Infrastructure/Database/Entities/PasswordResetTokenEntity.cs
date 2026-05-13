using System.Diagnostics.CodeAnalysis;

namespace Api.Infrastructure.Database.Entities;

[ExcludeFromCodeCoverage]
public sealed class PasswordResetTokenEntity
{
    public Guid Id { get; set; }
    public Guid MemberId { get; set; }
    public required string Token { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool Used { get; set; }
    public DateTime CreatedAt { get; set; }

    public MemberEntity Member { get; set; } = null!;
}
