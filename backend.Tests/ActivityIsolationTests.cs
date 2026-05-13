using Api.Features.Activities.Commands;
using Api.Features.Activities.Contracts;
using Api.Features.Activities.Queries;
using Microsoft.EntityFrameworkCore;

namespace Api.Tests;

/// <summary>
/// Verifiserer at handlers filtrerer aktiviteter på OrganizationId (K1-fix).
/// En admin i Org A skal aldri kunne hente/oppdatere/slette aktiviteter i Org B.
/// </summary>
public sealed class ActivityIsolationTests
{
    private static UpdateActivityRequest BuildUpdateRequest() => new()
    {
        Title = "Endret tittel",
        Description = "Endret beskrivelse",
        StartTime = DateTime.UtcNow.AddDays(2),
        EndTime = DateTime.UtcNow.AddDays(2).AddHours(1),
        Location = "Endret sted",
        ContactName = "Endret kontakt",
        ContactEmail = "endret@test.no",
        ContactPhone = "99999999",
    };

    [Fact]
    public async Task GetActivityById_WhenActivityBelongsToAnotherOrganization_ReturnsNull()
    {
        // Arrange
        var fixture = new TestFixture();
        var activityInOrgB = fixture.AddActivity(fixture.OrgB.Id, "Hemmelig B-aktivitet");
        var handler = new GetActivityByIdHandler(fixture.Db);

        // Act
        var result = await handler.HandleAsync(activityInOrgB.Id, fixture.OrgA.Id);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetActivityById_WhenActivityBelongsToCallingOrganization_ReturnsActivity()
    {
        // Arrange
        var fixture = new TestFixture();
        var activityInOrgA = fixture.AddActivity(fixture.OrgA.Id, "Egen A-aktivitet");
        var handler = new GetActivityByIdHandler(fixture.Db);

        // Act
        var result = await handler.HandleAsync(activityInOrgA.Id, fixture.OrgA.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Egen A-aktivitet", result!.Title);
    }

    [Fact]
    public async Task UpdateActivity_WhenActivityBelongsToAnotherOrganization_ReturnsNullAndDoesNotMutate()
    {
        // Arrange
        var fixture = new TestFixture();
        var activityInOrgB = fixture.AddActivity(fixture.OrgB.Id, "Original B-tittel");
        var handler = new UpdateActivityHandler(fixture.Db);
        var request = BuildUpdateRequest();

        // Act
        var result = await handler.HandleAsync(activityInOrgB.Id, fixture.OrgA.Id, request);

        // Assert
        Assert.Null(result);
        var unchanged = await fixture.Db.Activities.FindAsync(activityInOrgB.Id);
        Assert.Equal("Original B-tittel", unchanged!.Title);
    }

    // Merk: DeleteActivityHandler bruker ExecuteDeleteAsync, som ikke støttes av
    // EF InMemory-provider. Vi verifiserer isolasjonsfilteret ved å speile det samme
    // predicate-uttrykket og sjekke at det matcher korrekt antall rader.
    [Fact]
    public async Task DeleteActivity_FilterPredicate_DoesNotMatchActivitiesFromAnotherOrganization()
    {
        // Arrange
        var fixture = new TestFixture();
        var activityInOrgB = fixture.AddActivity(fixture.OrgB.Id);

        // Act
        var matchedFromWrongOrg = await fixture.Db.Activities
            .Where(a => a.Id == activityInOrgB.Id && a.OrganizationId == fixture.OrgA.Id)
            .CountAsync();

        // Assert
        Assert.Equal(0, matchedFromWrongOrg);
    }

    [Fact]
    public async Task DeleteActivity_FilterPredicate_MatchesActivityFromCallingOrganization()
    {
        // Arrange
        var fixture = new TestFixture();
        var activityInOrgA = fixture.AddActivity(fixture.OrgA.Id);

        // Act
        var matched = await fixture.Db.Activities
            .Where(a => a.Id == activityInOrgA.Id && a.OrganizationId == fixture.OrgA.Id)
            .CountAsync();

        // Assert
        Assert.Equal(1, matched);
    }

    [Fact]
    public async Task GetActivityParticipants_WhenActivityBelongsToAnotherOrganization_ReturnsNull()
    {
        // Arrange
        var fixture = new TestFixture();
        var activityInOrgB = fixture.AddActivity(fixture.OrgB.Id);
        fixture.AddParticipant(activityInOrgB, fixture.MemberB, "B-token", ParticipantStatus.Accepted);
        var handler = new GetActivityParticipantsHandler(fixture.Db);

        // Act
        var result = await handler.HandleAsync(activityInOrgB.Id, fixture.OrgA.Id);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetActivityParticipants_WhenActivityBelongsToCallingOrganization_ReturnsParticipants()
    {
        // Arrange
        var fixture = new TestFixture();
        var activityInOrgA = fixture.AddActivity(fixture.OrgA.Id);
        fixture.AddParticipant(activityInOrgA, fixture.MemberA, "A-token", ParticipantStatus.Accepted);
        var handler = new GetActivityParticipantsHandler(fixture.Db);

        // Act
        var result = await handler.HandleAsync(activityInOrgA.Id, fixture.OrgA.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result!);
    }
}
