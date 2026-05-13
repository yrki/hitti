using Api.Features.Activities.Contracts;
using Api.Features.Members.Contracts;
using Api.Infrastructure.Database;
using Api.Infrastructure.Database.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Tests;

/// <summary>
/// Lite test-fixture som setter opp en EF InMemory DbContext med 2 organisasjoner,
/// en admin og et medlem per organisasjon. Gir også tilgang til PasswordHasher med
/// samme HashTarget-pattern som AuthController bruker.
/// </summary>
public sealed class TestFixture
{
    public static readonly object HashTarget = new();

    public ApplicationDbContext Db { get; }
    public IPasswordHasher<object> PasswordHasher { get; } = new PasswordHasher<object>();

    public OrganizationEntity OrgA { get; }
    public OrganizationEntity OrgB { get; }
    public MemberEntity AdminA { get; }
    public MemberEntity AdminB { get; }
    public MemberEntity MemberA { get; }
    public MemberEntity MemberB { get; }

    public const string AdminAPassword = "AdminA-Passord-123";
    public const string AdminBPassword = "AdminB-Passord-456";

    public TestFixture()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase($"hitti-test-{Guid.NewGuid()}")
            .Options;

        Db = new ApplicationDbContext(options);

        OrgA = new OrganizationEntity
        {
            Id = Guid.NewGuid(),
            Name = "Org A",
            Email = "orga@test.no",
            Phone = "11111111",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        OrgB = new OrganizationEntity
        {
            Id = Guid.NewGuid(),
            Name = "Org B",
            Email = "orgb@test.no",
            Phone = "22222222",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        AdminA = new MemberEntity
        {
            Id = Guid.NewGuid(),
            Name = "Admin A",
            Email = "admin.a@test.no",
            Phone = "11111112",
            Status = MemberStatus.Active,
            Role = MemberRole.Admin,
            OrganizationId = OrgA.Id,
            PasswordHash = PasswordHasher.HashPassword(HashTarget, AdminAPassword),
            JoinedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        AdminB = new MemberEntity
        {
            Id = Guid.NewGuid(),
            Name = "Admin B",
            Email = "admin.b@test.no",
            Phone = "22222223",
            Status = MemberStatus.Active,
            Role = MemberRole.Admin,
            OrganizationId = OrgB.Id,
            PasswordHash = PasswordHasher.HashPassword(HashTarget, AdminBPassword),
            JoinedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        MemberA = new MemberEntity
        {
            Id = Guid.NewGuid(),
            Name = "Medlem A",
            Email = "medlem.a@test.no",
            Phone = "11111113",
            Status = MemberStatus.Active,
            Role = MemberRole.Member,
            OrganizationId = OrgA.Id,
            PasswordHash = PasswordHasher.HashPassword(HashTarget, "Medlem-A-Passord-789"),
            JoinedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        MemberB = new MemberEntity
        {
            Id = Guid.NewGuid(),
            Name = "Medlem B",
            Email = "medlem.b@test.no",
            Phone = "22222224",
            Status = MemberStatus.Active,
            Role = MemberRole.Member,
            OrganizationId = OrgB.Id,
            PasswordHash = PasswordHasher.HashPassword(HashTarget, "Medlem-B-Passord-012"),
            JoinedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        Db.Organizations.AddRange(OrgA, OrgB);
        Db.Members.AddRange(AdminA, AdminB, MemberA, MemberB);
        Db.SaveChanges();
    }

    public ActivityEntity AddActivity(Guid organizationId, string title = "Aktivitet")
    {
        var activity = new ActivityEntity
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            Title = title,
            Description = "Beskrivelse",
            StartTime = DateTime.UtcNow.AddDays(1),
            EndTime = DateTime.UtcNow.AddDays(1).AddHours(2),
            Location = "Stedet",
            ContactName = "Kontakt",
            ContactEmail = "kontakt@test.no",
            ContactPhone = "33333333",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        Db.Activities.Add(activity);
        Db.SaveChanges();
        return activity;
    }

    public ActivityParticipantEntity AddParticipant(
        ActivityEntity activity,
        MemberEntity member,
        string invitationToken,
        ParticipantStatus status = ParticipantStatus.Invited)
    {
        var participant = new ActivityParticipantEntity
        {
            Id = Guid.NewGuid(),
            ActivityId = activity.Id,
            MemberId = member.Id,
            Status = status,
            InvitationChannel = InvitationChannel.Email,
            InvitationToken = invitationToken,
            NotificationStatus = NotificationStatus.Sent,
            InvitedAt = DateTime.UtcNow,
        };

        Db.ActivityParticipants.Add(participant);
        Db.SaveChanges();
        return participant;
    }
}
