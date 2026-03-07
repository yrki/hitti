namespace Api.Features.Activities.Contracts;

public sealed record UpcomingActivityResponse
{
    public required Guid Id { get; init; }
    public required string Title { get; init; }
    public required DateTime StartTime { get; init; }
    public required DateTime EndTime { get; init; }
    public required string Location { get; init; }
    public required int AcceptedCount { get; init; }
    public required int DeclinedCount { get; init; }
    public required int InvitedCount { get; init; }
}
