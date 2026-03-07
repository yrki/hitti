using System.Security.Cryptography;
using Api.Features.Activities.Contracts;
using Api.Features.Members.Contracts;
using Api.Infrastructure.Database;
using Api.Infrastructure.Database.Entities;
using Api.Infrastructure.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Api.Features.Activities.Commands;

public sealed class SendInvitationsHandler(
    ApplicationDbContext dbContext,
    INotificationService notificationService,
    IConfiguration configuration,
    ILogger<SendInvitationsHandler> logger)
{
    public async Task<SendInvitationsResponse?> HandleAsync(
        Guid activityId,
        Guid organizationId,
        InvitationChannel channel,
        CancellationToken cancellationToken = default)
    {
        var activity = await dbContext.Activities
            .FirstOrDefaultAsync(a => a.Id == activityId, cancellationToken);

        if (activity is null)
        {
            return null;
        }

        var members = await dbContext.Members
            .Where(m => m.OrganizationId == organizationId && m.Status == MemberStatus.Active)
            .ToListAsync(cancellationToken);

        var existingParticipantMemberIds = await dbContext.ActivityParticipants
            .Where(ap => ap.ActivityId == activityId)
            .Select(ap => ap.MemberId)
            .ToHashSetAsync(cancellationToken);

        var newParticipants = new List<ActivityParticipantEntity>();
        var baseUrl = configuration.GetValue<string>("App:BaseUrl") ?? "http://localhost:3000";

        foreach (var member in members)
        {
            if (existingParticipantMemberIds.Contains(member.Id))
            {
                continue;
            }

            var token = GenerateToken();
            var participant = new ActivityParticipantEntity
            {
                Id = Guid.NewGuid(),
                ActivityId = activityId,
                MemberId = member.Id,
                Status = ParticipantStatus.Invited,
                InvitationChannel = channel,
                InvitationToken = token,
                InvitedAt = DateTime.UtcNow,
            };

            newParticipants.Add(participant);
            dbContext.ActivityParticipants.Add(participant);

            var rsvpUrl = $"{baseUrl}/svar/{token}";

            try
            {
                if (channel == InvitationChannel.Sms)
                {
                    var message = $"Du er invitert til \"{activity.Title}\" ({activity.StartTime:dd.MM.yyyy HH:mm}). Svar her: {rsvpUrl}";
                    await notificationService.SendSmsAsync(member.Phone, message, cancellationToken);
                }
                else
                {
                    var subject = $"Invitasjon: {activity.Title}";
                    var html = $"""
                        <h2>Du er invitert til {activity.Title}</h2>
                        <p><strong>Dato:</strong> {activity.StartTime:dd.MM.yyyy}</p>
                        <p><strong>Klokkeslett:</strong> {activity.StartTime:HH:mm} – {activity.EndTime:HH:mm}</p>
                        <p><strong>Sted:</strong> {activity.Location}</p>
                        <p><strong>Beskrivelse:</strong> {activity.Description}</p>
                        <p>Klikk på en av knappene under for å svare:</p>
                        <p>
                            <a href="{rsvpUrl}?svar=ja" style="display:inline-block;padding:12px 24px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;margin-right:8px;">Ja, jeg blir med</a>
                            <a href="{rsvpUrl}?svar=nei" style="display:inline-block;padding:12px 24px;background:#dc2626;color:#fff;text-decoration:none;border-radius:8px;">Nei, jeg kan ikke</a>
                        </p>
                        """;
                    await notificationService.SendEmailAsync(member.Email, member.Name, subject, html, cancellationToken);
                }

                logger.LogInformation("Invitation sent via {Channel} to {MemberName} ({MemberId}) for activity {ActivityId}",
                    channel, member.Name, member.Id, activityId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send {Channel} invitation to {MemberName} ({MemberId}) for activity {ActivityId}",
                    channel, member.Name, member.Id, activityId);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Sent {NewCount} invitations for activity {ActivityId}, {ExistingCount} already invited",
            newParticipants.Count, activityId, existingParticipantMemberIds.Count);

        return new SendInvitationsResponse
        {
            InvitedCount = newParticipants.Count,
            AlreadyInvitedCount = existingParticipantMemberIds.Count,
        };
    }

    private static string GenerateToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(24))
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
    }
}
