using Api.Features.Activities.Contracts;
using Api.Infrastructure.Database;
using Api.Infrastructure.Database.Entities;

namespace Api.Features.Activities.Commands;

public sealed class CreateActivityHandler(ApplicationDbContext dbContext)
{
    public async Task<ActivityResponse> HandleAsync(CreateActivityRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new ActivityEntity
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            ActivityDate = request.ActivityDate,
            Location = request.Location,
            ContactName = request.ContactName,
            ContactEmail = request.ContactEmail,
            ContactPhone = request.ContactPhone,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        dbContext.Activities.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new ActivityResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            ActivityDate = entity.ActivityDate,
            Location = entity.Location,
            ContactName = entity.ContactName,
            ContactEmail = entity.ContactEmail,
            ContactPhone = entity.ContactPhone
        };
    }
}
