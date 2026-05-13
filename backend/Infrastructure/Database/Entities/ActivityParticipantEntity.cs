using Api.Features.Activities.Contracts;
using System.Diagnostics.CodeAnalysis;

namespace Api.Infrastructure.Database.Entities;

[ExcludeFromCodeCoverage]
public sealed class ActivityParticipantEntity
{
    public Guid Id { get; set; }
    public Guid ActivityId { get; set; }
    public Guid MemberId { get; set; }
    public required ParticipantStatus Status { get; set; }
    public required InvitationChannel InvitationChannel { get; set; }
    public required string InvitationToken { get; set; }
    public required NotificationStatus NotificationStatus { get; set; }
    public DateTime InvitedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
    public DateTime? NotificationSentAt { get; set; }
    public DateTime? NotificationFailedAt { get; set; }

    public ActivityEntity Activity { get; set; } = null!;
    public MemberEntity Member { get; set; } = null!;
}
