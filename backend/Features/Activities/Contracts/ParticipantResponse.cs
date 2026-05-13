using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Activities.Contracts;

[ExcludeFromCodeCoverage]
public sealed record ParticipantResponse
{
    public required Guid Id { get; init; }
    public required Guid MemberId { get; init; }
    public required string MemberName { get; init; }
    public required string MemberEmail { get; init; }
    public required string MemberPhone { get; init; }
    public required ParticipantStatus Status { get; init; }
    public required InvitationChannel InvitationChannel { get; init; }
    public required NotificationStatus NotificationStatus { get; init; }
    public required DateTime InvitedAt { get; init; }
    public DateTime? RespondedAt { get; init; }
    public DateTime? NotificationSentAt { get; init; }
    public DateTime? NotificationFailedAt { get; init; }
}
