using Api.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Members.Commands;

public sealed class DeleteMemberHandler(ApplicationDbContext dbContext)
{
    public async Task<bool> HandleAsync(Guid id, Guid organizationId, CancellationToken cancellationToken = default)
    {
        var rowsDeleted = await dbContext.Members
            .Where(m => m.Id == id && m.OrganizationId == organizationId)
            .ExecuteDeleteAsync(cancellationToken);

        return rowsDeleted > 0;
    }
}
