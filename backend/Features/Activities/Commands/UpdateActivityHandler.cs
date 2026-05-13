using Api.Features.Activities.Contracts;
using Api.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Activities.Commands;

public sealed class UpdateActivityHandler(ApplicationDbContext dbContext)
{
    public async Task<ActivityResponse?> HandleAsync(Guid id, Guid organizationId, UpdateActivityRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.Activities
            .FirstOrDefaultAsync(a => a.Id == id && a.OrganizationId == organizationId, cancellationToken);

        if (entity is null)
        {
            return null;
        }

        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.StartTime = request.StartTime;
        entity.EndTime = request.EndTime;
        entity.Location = request.Location;
        entity.ContactName = request.ContactName;
        entity.ContactEmail = request.ContactEmail;
        entity.ContactPhone = request.ContactPhone;
        entity.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return new ActivityResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            StartTime = entity.StartTime,
            EndTime = entity.EndTime,
            Location = entity.Location,
            ContactName = entity.ContactName,
            ContactEmail = entity.ContactEmail,
            ContactPhone = entity.ContactPhone
        };
    }
}
