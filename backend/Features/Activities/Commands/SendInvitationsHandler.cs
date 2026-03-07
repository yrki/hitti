using System.Security.Cryptography;
using Api.Features.Activities.Contracts;
using Api.Features.Members.Contracts;
using Api.Infrastructure.BackgroundTasks;
using Api.Infrastructure.Database;
using Api.Infrastructure.Database.Entities;
using Api.Infrastructure.Notifications;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Activities.Commands;

public sealed class SendInvitationsHandler(
    ApplicationDbContext dbContext,
    IBackgroundTaskQueue taskQueue,
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
        var devRedirectEmail = configuration.GetValue<string>("App:DevRedirectEmail");

        var notificationItems = new List<NotificationWorkItem>();

        foreach (var member in members)
        {
            if (existingParticipantMemberIds.Contains(member.Id))
            {
                continue;
            }

            var token = GenerateToken();
            var participantId = Guid.NewGuid();
            var participant = new ActivityParticipantEntity
            {
                Id = participantId,
                ActivityId = activityId,
                MemberId = member.Id,
                Status = ParticipantStatus.Invited,
                InvitationChannel = channel,
                InvitationToken = token,
                NotificationStatus = NotificationStatus.Pending,
                InvitedAt = DateTime.UtcNow,
            };

            newParticipants.Add(participant);
            dbContext.ActivityParticipants.Add(participant);

            notificationItems.Add(new NotificationWorkItem
            {
                ParticipantId = participantId,
                MemberName = member.Name,
                MemberEmail = member.Email,
                MemberPhone = member.Phone,
                MemberId = member.Id,
                RsvpUrl = $"{baseUrl}/svar/{token}",
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Saved {NewCount} invitations for activity {ActivityId}, {ExistingCount} already invited",
            newParticipants.Count, activityId, existingParticipantMemberIds.Count);

        if (notificationItems.Count > 0)
        {
            var activityTitle = activity.Title;
            var activityStartTime = activity.StartTime;
            var activityEndTime = activity.EndTime;
            var activityLocation = activity.Location;
            var activityDescription = activity.Description;

            await taskQueue.EnqueueAsync(async (serviceProvider, stoppingToken) =>
            {
                var notificationService = serviceProvider.GetRequiredService<INotificationService>();
                var backgroundLogger = serviceProvider.GetRequiredService<ILogger<SendInvitationsHandler>>();
                var bgDbContext = serviceProvider.GetRequiredService<ApplicationDbContext>();

                foreach (var item in notificationItems)
                {
                    const int maxRetries = 5;
                    var sent = false;
                    for (var attempt = 0; attempt < maxRetries; attempt++)
                    {
                        try
                        {
                            if (!string.IsNullOrEmpty(devRedirectEmail))
                            {
                                var subject = $"[DEV → {item.MemberName}] Invitasjon: {activityTitle}";
                                var html = $"""
                                    <p><em>Opprinnelig mottaker: {item.MemberName} ({(channel == InvitationChannel.Sms ? item.MemberPhone : item.MemberEmail)})</em></p>
                                    <h2>Du er invitert til {activityTitle}</h2>
                                    <p><strong>Dato:</strong> {activityStartTime:dd.MM.yyyy}</p>
                                    <p><strong>Klokkeslett:</strong> {activityStartTime:HH:mm} – {activityEndTime:HH:mm}</p>
                                    <p><strong>Sted:</strong> {activityLocation}</p>
                                    <p><strong>Beskrivelse:</strong> {activityDescription}</p>
                                    <p>
                                        <a href="{item.RsvpUrl}?svar=ja" style="display:inline-block;padding:12px 24px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;margin-right:8px;">Ja, jeg blir med</a>
                                        <a href="{item.RsvpUrl}?svar=nei" style="display:inline-block;padding:12px 24px;background:#dc2626;color:#fff;text-decoration:none;border-radius:8px;">Nei, jeg kan ikke</a>
                                    </p>
                                    """;
                                await notificationService.SendEmailAsync(devRedirectEmail, "Dev", subject, html, stoppingToken);
                                backgroundLogger.LogInformation("DEV: Redirected {Channel} invitation for {MemberName} to {DevEmail}",
                                    channel, item.MemberName, devRedirectEmail);
                            }
                            else if (channel == InvitationChannel.Sms)
                            {
                                var message = $"Du er invitert til \"{activityTitle}\" ({activityStartTime:dd.MM.yyyy HH:mm}). Svar her: {item.RsvpUrl}";
                                await notificationService.SendSmsAsync(item.MemberPhone, message, stoppingToken);
                            }
                            else
                            {
                                var subject = $"Invitasjon: {activityTitle}";
                                var html = $"""
                                    <h2>Du er invitert til {activityTitle}</h2>
                                    <p><strong>Dato:</strong> {activityStartTime:dd.MM.yyyy}</p>
                                    <p><strong>Klokkeslett:</strong> {activityStartTime:HH:mm} – {activityEndTime:HH:mm}</p>
                                    <p><strong>Sted:</strong> {activityLocation}</p>
                                    <p><strong>Beskrivelse:</strong> {activityDescription}</p>
                                    <p>
                                        <a href="{item.RsvpUrl}?svar=ja" style="display:inline-block;padding:12px 24px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;margin-right:8px;">Ja, jeg blir med</a>
                                        <a href="{item.RsvpUrl}?svar=nei" style="display:inline-block;padding:12px 24px;background:#dc2626;color:#fff;text-decoration:none;border-radius:8px;">Nei, jeg kan ikke</a>
                                    </p>
                                    """;
                                await notificationService.SendEmailAsync(item.MemberEmail, item.MemberName, subject, html, stoppingToken);
                            }

                            backgroundLogger.LogInformation("Invitation sent via {Channel} to {MemberName} ({MemberId}) for activity {ActivityId}",
                                channel, item.MemberName, item.MemberId, activityId);
                            sent = true;
                            break;
                        }
                        catch (Azure.RequestFailedException ex) when (ex.Status == 429)
                        {
                            var delaySeconds = (attempt + 1) * 10;
                            backgroundLogger.LogWarning("Rate limited sending to {MemberName}, retrying in {Delay}s (attempt {Attempt}/{MaxRetries})",
                                item.MemberName, delaySeconds, attempt + 1, maxRetries);
                            await Task.Delay(TimeSpan.FromSeconds(delaySeconds), stoppingToken);
                        }
                        catch (Exception ex)
                        {
                            backgroundLogger.LogError(ex, "Failed to send {Channel} invitation to {MemberName} ({MemberId}) for activity {ActivityId}",
                                channel, item.MemberName, item.MemberId, activityId);
                            break;
                        }
                    }

                    await UpdateNotificationStatusAsync(bgDbContext, item.ParticipantId, sent, backgroundLogger);

                    if (!sent)
                    {
                        backgroundLogger.LogError("Giving up sending {Channel} invitation to {MemberName} ({MemberId}) after {MaxRetries} attempts",
                            channel, item.MemberName, item.MemberId, maxRetries);
                    }

                    await Task.Delay(TimeSpan.FromSeconds(8), stoppingToken);
                }
            });
        }

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

    private static async Task UpdateNotificationStatusAsync(
        ApplicationDbContext dbContext,
        Guid participantId,
        bool sent,
        ILogger logger)
    {
        try
        {
            var participant = await dbContext.ActivityParticipants
                .FindAsync(participantId);

            if (participant is null) return;

            if (sent)
            {
                participant.NotificationStatus = NotificationStatus.Sent;
                participant.NotificationSentAt = DateTime.UtcNow;
            }
            else
            {
                participant.NotificationStatus = NotificationStatus.Failed;
                participant.NotificationFailedAt = DateTime.UtcNow;
            }

            await dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to update notification status for participant {ParticipantId}", participantId);
        }
    }

    private sealed record NotificationWorkItem
    {
        public required Guid ParticipantId { get; init; }
        public required string MemberName { get; init; }
        public required string MemberEmail { get; init; }
        public required string MemberPhone { get; init; }
        public required Guid MemberId { get; init; }
        public required string RsvpUrl { get; init; }
    }
}
