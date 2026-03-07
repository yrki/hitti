using Api.Features.Members.Contracts;
using Api.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Members.Commands;

public sealed class UpdateMemberHandler(ApplicationDbContext dbContext)
{
    public async Task<MemberResponse?> HandleAsync(Guid id, UpdateMemberRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Members.FirstOrDefaultAsync(m => m.Id == id, cancellationToken);

        if (entity is null)
        {
            return null;
        }

        entity.Name = request.Name;
        entity.Email = request.Email;
        entity.Phone = request.Phone;
        entity.Status = request.Status;
        entity.JoinedAt = request.JoinedAt;
        entity.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return new MemberResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Email = entity.Email,
            Phone = entity.Phone,
            Status = entity.Status,
            JoinedAt = entity.JoinedAt
        };
    }
}
