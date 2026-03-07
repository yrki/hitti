using Api.Features.Settings.Contracts;
using Api.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Settings.Queries;

public sealed class GetSettingsHandler(ApplicationDbContext dbContext)
{
    public async Task<SettingsResponse?> HandleAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.OrganizationSettings
            .Select(s => new SettingsResponse
            {
                Id = s.Id,
                OrganizationName = s.OrganizationName,
                Email = s.Email,
                Phone = s.Phone
            })
            .FirstOrDefaultAsync(cancellationToken);
    }
}
