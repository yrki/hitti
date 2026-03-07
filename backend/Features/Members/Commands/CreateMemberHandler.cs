using Api.Features.Members.Contracts;
using Api.Infrastructure.Database;
using Api.Infrastructure.Database.Entities;

namespace Api.Features.Members.Commands;

public sealed class CreateMemberHandler(ApplicationDbContext dbContext)
{
    public async Task<MemberResponse> HandleAsync(CreateMemberRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new MemberEntity
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Status = request.Status,
            JoinedAt = request.JoinedAt,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        dbContext.Members.Add(entity);
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
