using Api.Features.Activities.Contracts;
using Api.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Activities.Queries;

public sealed class GetUpcomingActivitiesHandler(ApplicationDbContext dbContext)
{
    public async Task<IReadOnlyList<UpcomingActivityResponse>> HandleAsync(Guid organizationId, int count, CancellationToken cancellationToken = default)
    {
        return await dbContext.Activities
            .Where(a => a.OrganizationId == organizationId && a.StartTime >= DateTime.UtcNow.Date)
            .OrderBy(a => a.StartTime)
            .Take(count)
            .Select(a => new UpcomingActivityResponse
            {
                Id = a.Id,
                Title = a.Title,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                Location = a.Location,
                AcceptedCount = dbContext.ActivityParticipants.Count(p => p.ActivityId == a.Id && p.Status == ParticipantStatus.Accepted),
                DeclinedCount = dbContext.ActivityParticipants.Count(p => p.ActivityId == a.Id && p.Status == ParticipantStatus.Declined),
                InvitedCount = dbContext.ActivityParticipants.Count(p => p.ActivityId == a.Id && p.Status == ParticipantStatus.Invited),
            })
            .ToListAsync(cancellationToken);
    }
}
