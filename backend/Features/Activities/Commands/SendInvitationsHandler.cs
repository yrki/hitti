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

            notificationItems.Add(new NotificationWorkItem
            {
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

                foreach (var item in notificationItems)
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
                    }
                    catch (Exception ex)
                    {
                        backgroundLogger.LogError(ex, "Failed to send {Channel} invitation to {MemberName} ({MemberId}) for activity {ActivityId}",
                            channel, item.MemberName, item.MemberId, activityId);
                    }
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

    private sealed record NotificationWorkItem
    {
        public required string MemberName { get; init; }
        public required string MemberEmail { get; init; }
        public required string MemberPhone { get; init; }
        public required Guid MemberId { get; init; }
        public required string RsvpUrl { get; init; }
    }
}
