using Api.Features.Activities.Contracts;
using Api.Infrastructure.BackgroundTasks;
using Api.Infrastructure.Database;
using Api.Infrastructure.Database.Entities;
using Api.Infrastructure.Notifications;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Activities.Commands;

public sealed class ResendInvitationHandler(
    ApplicationDbContext dbContext,
    IBackgroundTaskQueue taskQueue,
    IConfiguration configuration)
{
    public async Task<bool> HandleAsync(Guid activityId, Guid participantId, Guid organizationId, CancellationToken cancellationToken = default)
    {
        var participant = await dbContext.ActivityParticipants
            .Include(ap => ap.Activity)
            .FirstOrDefaultAsync(ap => ap.Id == participantId && ap.ActivityId == activityId, cancellationToken);

        if (participant is null)
            return false;

        var member = await dbContext.Members.FirstOrDefaultAsync(m => m.Id == participant.MemberId && m.OrganizationId == organizationId, cancellationToken);
        if (member is null)
            return false;

        var baseUrl = configuration.GetValue<string>("App:BaseUrl") ?? "http://localhost:3000";
        var devRedirectEmail = configuration.GetValue<string>("App:DevRedirectEmail");
        var rsvpUrl = $"{baseUrl}/svar/{participant.InvitationToken}";
        var activity = participant.Activity;

        await taskQueue.EnqueueAsync(async (serviceProvider, stoppingToken) =>
        {
            var notificationService = serviceProvider.GetRequiredService<INotificationService>();
            var backgroundLogger = serviceProvider.GetRequiredService<ILogger<ResendInvitationHandler>>();
            var bgDbContext = serviceProvider.GetRequiredService<ApplicationDbContext>();

            try
            {
                var channel = participant.InvitationChannel;
                var sent = false;
                const int maxRetries = 5;
                for (var attempt = 0; attempt < maxRetries; attempt++)
                {
                    try
                    {
                        if (!string.IsNullOrEmpty(devRedirectEmail))
                        {
                            var subject = $"[DEV → {member.Name}] Invitasjon: {activity.Title}";
                            var html = $"""
<p><em>Opprinnelig mottaker: {member.Name} ({(channel == InvitationChannel.Sms ? member.Phone : member.Email)})</em></p>
<h2>Du er invitert til {activity.Title}</h2>
<p><strong>Dato:</strong> {activity.StartTime:dd.MM.yyyy}</p>
<p><strong>Klokkeslett:</strong> {activity.StartTime:HH:mm} – {activity.EndTime:HH:mm}</p>
<p><strong>Sted:</strong> {activity.Location}</p>
<p><strong>Beskrivelse:</strong> {activity.Description}</p>
<p>
    <a href=\"{rsvpUrl}?svar=ja\" style=\"display:inline-block;padding:12px 24px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;margin-right:8px;\">Ja, jeg blir med</a>
    <a href=\"{rsvpUrl}?svar=nei\" style=\"display:inline-block;padding:12px 24px;background:#991b1b;color:#fff;text-decoration:none;border-radius:8px;\">Nei, kan ikke</a>
</p>
""";
                            await notificationService.SendEmailAsync(devRedirectEmail, member.Name, subject, html, stoppingToken);
                            backgroundLogger.LogInformation("DEV: Redirected {Channel} invitation for {MemberName} to {DevEmail}", channel, member.Name, devRedirectEmail);
                        }
                        else if (channel == InvitationChannel.Sms)
                        {
                            var sms = $"Du er invitert til {activity.Title} {activity.StartTime:dd.MM.yyyy HH:mm} på {activity.Location}. Svar: {rsvpUrl}";
                            await notificationService.SendSmsAsync(member.Phone, sms, stoppingToken);
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
<p>
    <a href=\"{rsvpUrl}?svar=ja\" style=\"display:inline-block;padding:12px 24px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;margin-right:8px;\">Ja, jeg blir med</a>
    <a href=\"{rsvpUrl}?svar=nei\" style=\"display:inline-block;padding:12px 24px;background:#991b1b;color:#fff;text-decoration:none;border-radius:8px;\">Nei, kan ikke</a>
</p>
""";
                            await notificationService.SendEmailAsync(member.Email, member.Name, subject, html, stoppingToken);
                        }
                        sent = true;
                        break;
                    }
                    catch (Exception ex)
                    {
                        backgroundLogger.LogError(ex, "Failed to resend invitation to {MemberName} ({MemberId}) for activity {ActivityId}", member.Name, member.Id, activity.Id);
                        await Task.Delay(1000, stoppingToken);
                    }
                }
                // Update notification status
                var bgParticipant = await bgDbContext.ActivityParticipants.FindAsync(participantId);
                if (bgParticipant != null)
                {
                    bgParticipant.NotificationStatus = sent ? NotificationStatus.Sent : NotificationStatus.Failed;
                    if (sent)
                        bgParticipant.NotificationSentAt = DateTime.UtcNow;
                    else
                        bgParticipant.NotificationFailedAt = DateTime.UtcNow;
                    await bgDbContext.SaveChangesAsync(stoppingToken);
                }
            }
            catch (Exception ex)
            {
                backgroundLogger.LogError(ex, "Failed to resend invitation for participant {ParticipantId}", participantId);
            }
        });
        return true;
    }
}
