using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Activities.Contracts;

[ExcludeFromCodeCoverage]
public sealed record CreateActivityRequest
{
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required DateTime StartTime { get; init; }
    public required DateTime EndTime { get; init; }
    public required string Location { get; init; }
    public required string ContactName { get; init; }
    public required string ContactEmail { get; init; }
    public required string ContactPhone { get; init; }
}
