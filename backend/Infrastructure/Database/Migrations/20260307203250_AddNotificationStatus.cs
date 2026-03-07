using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "NotificationFailedAt",
                table: "activity_participants",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NotificationSentAt",
                table: "activity_participants",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NotificationStatus",
                table: "activity_participants",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Sent");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NotificationFailedAt",
                table: "activity_participants");

            migrationBuilder.DropColumn(
                name: "NotificationSentAt",
                table: "activity_participants");

            migrationBuilder.DropColumn(
                name: "NotificationStatus",
                table: "activity_participants");
        }
    }
}
