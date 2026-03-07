using Api.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Activities.Commands;

public sealed class DeleteActivityHandler(ApplicationDbContext dbContext)
{
    public async Task<bool> HandleAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var rowsDeleted = await dbContext.Activities
            .Where(a => a.Id == id)
            .ExecuteDeleteAsync(cancellationToken);

        return rowsDeleted > 0;
    }
}
