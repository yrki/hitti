using Api.Features.Activities.Commands;
using Api.Features.Activities.Contracts;
using Microsoft.Extensions.Logging.Abstractions;

namespace Api.Tests;

public sealed class RespondToInvitationHandlerTests
{
    [Fact]
    public async Task HandleAsync_WithValidTokenAndJa_SetsStatusAcceptedAndRespondedAt()
    {
        // Arrange
        var fixture = new TestFixture();
        var activity = fixture.AddActivity(fixture.OrgA.Id);
        var participant = fixture.AddParticipant(activity, fixture.MemberA, "token-ja");
        var handler = new RespondToInvitationHandler(fixture.Db, NullLogger<RespondToInvitationHandler>.Instance);

        // Act
        var result = await handler.HandleAsync("token-ja", "ja");

        // Assert
        Assert.NotNull(result);
        Assert.True(result!.Accepted);
        var refreshed = await fixture.Db.ActivityParticipants.FindAsync(participant.Id);
        Assert.Equal(ParticipantStatus.Accepted, refreshed!.Status);
        Assert.NotNull(refreshed.RespondedAt);
    }

    [Fact]
    public async Task HandleAsync_WithValidTokenAndNei_SetsStatusDeclined()
    {
        // Arrange
        var fixture = new TestFixture();
        var activity = fixture.AddActivity(fixture.OrgA.Id);
        var participant = fixture.AddParticipant(activity, fixture.MemberA, "token-nei");
        var handler = new RespondToInvitationHandler(fixture.Db, NullLogger<RespondToInvitationHandler>.Instance);

        // Act
        var result = await handler.HandleAsync("token-nei", "nei");

        // Assert
        Assert.NotNull(result);
        Assert.False(result!.Accepted);
        var refreshed = await fixture.Db.ActivityParticipants.FindAsync(participant.Id);
        Assert.Equal(ParticipantStatus.Declined, refreshed!.Status);
    }

    [Fact]
    public async Task HandleAsync_WithUnknownToken_ReturnsNull()
    {
        // Arrange
        var fixture = new TestFixture();
        var handler = new RespondToInvitationHandler(fixture.Db, NullLogger<RespondToInvitationHandler>.Instance);

        // Act
        var result = await handler.HandleAsync("ugyldig-token", "ja");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task HandleAsync_WhenChangingResponse_UpdatesStatusFromAcceptedToDeclined()
    {
        // Arrange
        var fixture = new TestFixture();
        var activity = fixture.AddActivity(fixture.OrgA.Id);
        var participant = fixture.AddParticipant(activity, fixture.MemberA, "token-endring", ParticipantStatus.Accepted);
        var handler = new RespondToInvitationHandler(fixture.Db, NullLogger<RespondToInvitationHandler>.Instance);

        // Act
        await handler.HandleAsync("token-endring", "nei");

        // Assert
        var refreshed = await fixture.Db.ActivityParticipants.FindAsync(participant.Id);
        Assert.Equal(ParticipantStatus.Declined, refreshed!.Status);
    }
}
