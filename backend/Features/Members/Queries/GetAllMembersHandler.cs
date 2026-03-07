using Api.Features.Members.Contracts;
using Api.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Members.Queries;

public sealed class GetAllMembersHandler(ApplicationDbContext dbContext)
{
    public async Task<IReadOnlyList<MemberResponse>> HandleAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Members
            .OrderBy(m => m.Name)
            .Select(m => new MemberResponse
            {
                Id = m.Id,
                Name = m.Name,
                Email = m.Email,
                Phone = m.Phone,
                Status = m.Status,
                JoinedAt = m.JoinedAt
            })
            .ToListAsync(cancellationToken);
    }
}
