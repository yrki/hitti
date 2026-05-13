using Api.Features.Activities.Contracts;
using Api.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Activities.Queries;

public sealed class GetActivityParticipantsHandler(ApplicationDbContext dbContext)
{
    public async Task<IReadOnlyList<ParticipantResponse>?> HandleAsync(
        Guid activityId,
        Guid organizationId,
        CancellationToken cancellationToken = default)
    {
        var activityExists = await dbContext.Activities
            .AnyAsync(a => a.Id == activityId && a.OrganizationId == organizationId, cancellationToken);

        if (!activityExists)
        {
            return null;
        }

        return await dbContext.ActivityParticipants
            .Where(ap => ap.ActivityId == activityId)
            .Include(ap => ap.Member)
            .OrderBy(ap => ap.Member.Name)
            .Select(ap => new ParticipantResponse
            {
                Id = ap.Id,
                MemberId = ap.MemberId,
                MemberName = ap.Member.Name,
                MemberEmail = ap.Member.Email,
                MemberPhone = ap.Member.Phone,
                Status = ap.Status,
                InvitationChannel = ap.InvitationChannel,
                NotificationStatus = ap.NotificationStatus,
                InvitedAt = ap.InvitedAt,
                RespondedAt = ap.RespondedAt,
                NotificationSentAt = ap.NotificationSentAt,
                NotificationFailedAt = ap.NotificationFailedAt,
            })
            .ToListAsync(cancellationToken);
    }
}
