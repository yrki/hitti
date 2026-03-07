namespace Api.Features.Activities.Contracts;

public sealed record SendInvitationsRequest
{
    public required InvitationChannel Channel { get; init; }
}
