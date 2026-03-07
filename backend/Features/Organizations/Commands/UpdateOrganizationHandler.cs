using Api.Features.Organizations.Contracts;
using Api.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Organizations.Commands;

public sealed class UpdateOrganizationHandler(ApplicationDbContext dbContext)
{
    public async Task<UpdateOrganizationResponse?> HandleAsync(Guid organizationId, UpdateOrganizationRequest request, CancellationToken cancellationToken = default)
    {
        var org = await dbContext.Organizations
            .FirstOrDefaultAsync(o => o.Id == organizationId, cancellationToken);

        if (org is null)
        {
            return null;
        }

        org.Name = request.Name;
        org.Email = request.Email;
        org.Phone = request.Phone.Replace(" ", "", StringComparison.Ordinal);
        org.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return new UpdateOrganizationResponse
        {
            Id = org.Id,
            Name = org.Name,
            Email = org.Email,
            Phone = org.Phone,
        };
    }
}
