namespace Api.Features.Activities.Contracts;

public sealed record SendInvitationsResponse
{
    public required int InvitedCount { get; init; }
    public required int AlreadyInvitedCount { get; init; }
}
