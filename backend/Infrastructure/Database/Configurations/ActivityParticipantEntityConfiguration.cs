using Api.Infrastructure.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Infrastructure.Database.Configurations;

public sealed class ActivityParticipantEntityConfiguration : IEntityTypeConfiguration<ActivityParticipantEntity>
{
    public void Configure(EntityTypeBuilder<ActivityParticipantEntity> builder)
    {
        builder.ToTable("activity_participants");

        builder.HasKey(ap => ap.Id);
        builder.Property(ap => ap.Id).ValueGeneratedOnAdd();

        builder.Property(ap => ap.Status).IsRequired().HasMaxLength(20).HasConversion<string>();
        builder.Property(ap => ap.InvitationChannel).IsRequired().HasMaxLength(10).HasConversion<string>();
        builder.Property(ap => ap.InvitationToken).IsRequired().HasMaxLength(100);
        builder.Property(ap => ap.NotificationStatus).IsRequired().HasMaxLength(20).HasConversion<string>();
        builder.Property(ap => ap.InvitedAt).IsRequired();

        builder.HasOne(ap => ap.Activity)
            .WithMany(a => a.Participants)
            .HasForeignKey(ap => ap.ActivityId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ap => ap.Member)
            .WithMany()
            .HasForeignKey(ap => ap.MemberId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(ap => ap.InvitationToken).IsUnique();
        builder.HasIndex(ap => new { ap.ActivityId, ap.MemberId }).IsUnique();
    }
}
