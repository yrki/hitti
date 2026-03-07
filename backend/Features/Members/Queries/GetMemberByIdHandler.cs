using Api.Features.Members.Contracts;
using Api.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Members.Queries;

public sealed class GetMemberByIdHandler(ApplicationDbContext dbContext)
{
    public async Task<MemberResponse?> HandleAsync(Guid id, Guid organizationId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Members
            .Where(m => m.Id == id && m.OrganizationId == organizationId)
            .Select(m => new MemberResponse
            {
                Id = m.Id,
                Name = m.Name,
                Email = m.Email,
                Phone = m.Phone,
                Status = m.Status,
                Role = m.Role,
                JoinedAt = m.JoinedAt
            })
            .FirstOrDefaultAsync(cancellationToken);
    }
}
