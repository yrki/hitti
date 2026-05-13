using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Activities.Contracts;

[ExcludeFromCodeCoverage]
public sealed record SendInvitationsResponse
{
    public required int InvitedCount { get; init; }
    public required int AlreadyInvitedCount { get; init; }
}
