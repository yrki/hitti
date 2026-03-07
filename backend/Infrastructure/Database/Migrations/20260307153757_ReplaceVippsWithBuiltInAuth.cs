using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceVippsWithBuiltInAuth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "user_organizations");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropIndex(
                name: "IX_members_Email",
                table: "members");

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "members",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "members",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "members",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            // Delete existing members that have no valid organization
            migrationBuilder.Sql("DELETE FROM members WHERE \"OrganizationId\" = '00000000-0000-0000-0000-000000000000'");

            migrationBuilder.CreateIndex(
                name: "IX_members_Email_OrganizationId",
                table: "members",
                columns: new[] { "Email", "OrganizationId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_members_OrganizationId",
                table: "members",
                column: "OrganizationId");

            migrationBuilder.AddForeignKey(
                name: "FK_members_organizations_OrganizationId",
                table: "members",
                column: "OrganizationId",
                principalTable: "organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_members_organizations_OrganizationId",
                table: "members");

            migrationBuilder.DropIndex(
                name: "IX_members_Email_OrganizationId",
                table: "members");

            migrationBuilder.DropIndex(
                name: "IX_members_OrganizationId",
                table: "members");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "members");

            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "members");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "members");

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    VippsSubjectId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "user_organizations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_organizations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_user_organizations_organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_organizations_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_members_Email",
                table: "members",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_organizations_OrganizationId",
                table: "user_organizations",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_user_organizations_UserId_OrganizationId",
                table: "user_organizations",
                columns: new[] { "UserId", "OrganizationId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_VippsSubjectId",
                table: "users",
                column: "VippsSubjectId",
                unique: true);
        }
    }
}
