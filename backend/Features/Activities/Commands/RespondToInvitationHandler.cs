using Api.Features.Activities.Contracts;
using Api.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Activities.Commands;

public sealed class RespondToInvitationHandler(
    ApplicationDbContext dbContext,
    ILogger<RespondToInvitationHandler> logger)
{
    public async Task<RespondResult?> HandleAsync(
        string token,
        string response,
        CancellationToken cancellationToken = default)
    {
        var participant = await dbContext.ActivityParticipants
            .Include(ap => ap.Activity)
            .FirstOrDefaultAsync(ap => ap.InvitationToken == token, cancellationToken);

        if (participant is null)
        {
            logger.LogWarning("RSVP attempt with invalid token");
            return null;
        }

        var newStatus = response == "ja" ? ParticipantStatus.Accepted : ParticipantStatus.Declined;
        participant.Status = newStatus;
        participant.RespondedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Member {MemberId} responded {Status} to activity {ActivityId}",
            participant.MemberId, newStatus, participant.ActivityId);

        return new RespondResult
        {
            ActivityTitle = participant.Activity.Title,
            StartTime = participant.Activity.StartTime,
            EndTime = participant.Activity.EndTime,
            ActivityLocation = participant.Activity.Location,
            Accepted = newStatus == ParticipantStatus.Accepted,
        };
    }
}

public sealed record RespondResult
{
    public required string ActivityTitle { get; init; }
    public required DateTime StartTime { get; init; }
    public required DateTime EndTime { get; init; }
    public required string ActivityLocation { get; init; }
    public required bool Accepted { get; init; }
}
