using Api.Features.Activities.Contracts;
using Api.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Activities.Queries;

public sealed class GetActivityByIdHandler(ApplicationDbContext dbContext)
{
    public async Task<ActivityResponse?> HandleAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Activities
            .Where(a => a.Id == id)
            .Select(a => new ActivityResponse
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                Location = a.Location,
                ContactName = a.ContactName,
                ContactEmail = a.ContactEmail,
                ContactPhone = a.ContactPhone
            })
            .FirstOrDefaultAsync(cancellationToken);
    }
}
