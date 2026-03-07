namespace Api.Features.Activities.Contracts;

public sealed record ActivityResponse
{
    public required Guid Id { get; init; }
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required DateTime ActivityDate { get; init; }
    public required string Location { get; init; }
    public required string ContactName { get; init; }
    public required string ContactEmail { get; init; }
    public required string ContactPhone { get; init; }
}
