using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Activities.Contracts;

[ExcludeFromCodeCoverage]
public sealed record SendInvitationsRequest
{
    public required InvitationChannel Channel { get; init; }
}
