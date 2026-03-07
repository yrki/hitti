using Api.Infrastructure.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Infrastructure.Database.Configurations;

public sealed class MemberEntityConfiguration : IEntityTypeConfiguration<MemberEntity>
{
    public void Configure(EntityTypeBuilder<MemberEntity> builder)
    {
        builder.ToTable("members");

        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).ValueGeneratedOnAdd();

        builder.Property(m => m.Name).IsRequired().HasMaxLength(200);
        builder.Property(m => m.Email).IsRequired().HasMaxLength(200);
        builder.Property(m => m.Phone).IsRequired().HasMaxLength(50);
        builder.Property(m => m.Status).IsRequired().HasMaxLength(20);
        builder.Property(m => m.Role).IsRequired().HasMaxLength(20);
        builder.Property(m => m.PasswordHash).HasMaxLength(500);

        builder.Property(m => m.JoinedAt).IsRequired();
        builder.Property(m => m.CreatedAt).IsRequired();
        builder.Property(m => m.UpdatedAt).IsRequired();

        builder.HasOne(m => m.Organization)
            .WithMany(o => o.Members)
            .HasForeignKey(m => m.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(m => new { m.Email, m.OrganizationId }).IsUnique();
    }
}
