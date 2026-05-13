using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganizationIdToActivities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "activities",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE activities
                SET "OrganizationId" = (SELECT "Id" FROM organizations ORDER BY "CreatedAt" LIMIT 1)
                WHERE "OrganizationId" IS NULL;

                DELETE FROM activities WHERE "OrganizationId" IS NULL;
                """);

            migrationBuilder.AlterColumn<Guid>(
                name: "OrganizationId",
                table: "activities",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_activities_OrganizationId",
                table: "activities",
                column: "OrganizationId");

            migrationBuilder.AddForeignKey(
                name: "FK_activities_organizations_OrganizationId",
                table: "activities",
                column: "OrganizationId",
                principalTable: "organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_activities_organizations_OrganizationId",
                table: "activities");

            migrationBuilder.DropIndex(
                name: "IX_activities_OrganizationId",
                table: "activities");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "activities");
        }
    }
}
