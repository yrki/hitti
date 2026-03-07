using Api.Infrastructure.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Infrastructure.Database.Configurations;

public sealed class ActivityEntityConfiguration : IEntityTypeConfiguration<ActivityEntity>
{
    public void Configure(EntityTypeBuilder<ActivityEntity> builder)
    {
        builder.ToTable("activities");

        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).ValueGeneratedOnAdd();

        builder.Property(a => a.Title).IsRequired().HasMaxLength(200);
        builder.Property(a => a.Description).IsRequired();
        builder.Property(a => a.Location).IsRequired().HasMaxLength(300);
        builder.Property(a => a.ContactName).IsRequired().HasMaxLength(200);
        builder.Property(a => a.ContactEmail).IsRequired().HasMaxLength(200);
        builder.Property(a => a.ContactPhone).IsRequired().HasMaxLength(50);

        builder.Property(a => a.ActivityDate).IsRequired();
        builder.Property(a => a.CreatedAt).IsRequired();
        builder.Property(a => a.UpdatedAt).IsRequired();
    }
}
