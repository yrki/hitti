using Api.Features.Settings.Contracts;
using Api.Infrastructure.Database;
using Api.Infrastructure.Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Settings.Commands;

public sealed class UpdateSettingsHandler(ApplicationDbContext dbContext)
{
    public async Task<SettingsResponse> HandleAsync(UpdateSettingsRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await dbContext.OrganizationSettings.FirstOrDefaultAsync(cancellationToken);

        if (entity is null)
        {
            entity = new OrganizationSettingsEntity
            {
                Id = Guid.NewGuid(),
                OrganizationName = request.OrganizationName,
                Email = request.Email,
                Phone = request.Phone,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            dbContext.OrganizationSettings.Add(entity);
        }
        else
        {
            entity.OrganizationName = request.OrganizationName;
            entity.Email = request.Email;
            entity.Phone = request.Phone;
            entity.UpdatedAt = DateTime.UtcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return new SettingsResponse
        {
            Id = entity.Id,
            OrganizationName = entity.OrganizationName,
            Email = entity.Email,
            Phone = entity.Phone
        };
    }
}
