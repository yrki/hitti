using Api.Features.Members.Contracts;
using Api.Infrastructure.Database;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Members.Commands;

public sealed class UpdateMemberHandler(ApplicationDbContext dbContext, IPasswordHasher<object> passwordHasher)
{
    private static readonly object HashTarget = new();

    public async Task<MemberResponse?> HandleAsync(Guid id, Guid organizationId, UpdateMemberRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Members
            .FirstOrDefaultAsync(m => m.Id == id && m.OrganizationId == organizationId, cancellationToken);

        if (entity is null)
        {
            return null;
        }

        entity.Name = request.Name;
        entity.Email = request.Email;
        entity.Phone = request.Phone.Replace(" ", "", StringComparison.Ordinal);
        entity.Status = request.Status;
        entity.Role = request.Role;
        entity.JoinedAt = request.JoinedAt;
        entity.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            entity.PasswordHash = passwordHasher.HashPassword(HashTarget, request.Password);
        }

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
