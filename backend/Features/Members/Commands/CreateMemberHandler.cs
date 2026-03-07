using Api.Features.Members.Contracts;
using Api.Infrastructure.Database;
using Api.Infrastructure.Database.Entities;
using Microsoft.AspNetCore.Identity;

namespace Api.Features.Members.Commands;

public sealed class CreateMemberHandler(ApplicationDbContext dbContext, IPasswordHasher<object> passwordHasher)
{
    private static readonly object HashTarget = new();

    public async Task<MemberResponse> HandleAsync(Guid organizationId, CreateMemberRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new MemberEntity
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone.Replace(" ", "", StringComparison.Ordinal),
            Status = request.Status,
            Role = request.Role,
            OrganizationId = organizationId,
            JoinedAt = request.JoinedAt,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            entity.PasswordHash = passwordHasher.HashPassword(HashTarget, request.Password);
        }

        dbContext.Members.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new MemberResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Email = entity.Email,
            Phone = entity.Phone,
            Status = entity.Status,
            Role = entity.Role,
            JoinedAt = entity.JoinedAt
        };
    }
}
