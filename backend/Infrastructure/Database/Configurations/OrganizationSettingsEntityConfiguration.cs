using Api.Infrastructure.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Infrastructure.Database.Configurations;

public sealed class OrganizationSettingsEntityConfiguration : IEntityTypeConfiguration<OrganizationSettingsEntity>
{
    public void Configure(EntityTypeBuilder<OrganizationSettingsEntity> builder)
    {
        builder.ToTable("organization_settings");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).ValueGeneratedOnAdd();

        builder.Property(s => s.OrganizationName).IsRequired().HasMaxLength(300);
        builder.Property(s => s.Email).IsRequired().HasMaxLength(200);
        builder.Property(s => s.Phone).IsRequired().HasMaxLength(50);

        builder.Property(s => s.CreatedAt).IsRequired();
        builder.Property(s => s.UpdatedAt).IsRequired();
    }
}
