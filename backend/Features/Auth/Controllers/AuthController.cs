using System.Security.Claims;
using System.Security.Cryptography;
using Api.Features.Auth.Contracts;
using Api.Features.Members.Contracts;
using Api.Infrastructure.Authentication;
using Api.Infrastructure.Database;
using Api.Infrastructure.Database.Entities;
using Api.Infrastructure.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Auth.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController(
    ApplicationDbContext dbContext,
    JwtTokenService jwtTokenService,
    IPasswordHasher<object> passwordHasher,
    INotificationService notificationService,
    IConfiguration configuration,
    ILogger<AuthController> logger) : ControllerBase
{
    private static readonly object HashTarget = new();

    [HttpPost("login")]
    public async Task<ActionResult<TokenResponse>> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        logger.LogInformation("Login attempt for {Email}", request.Email);

        var member = await dbContext.Members
            .Include(m => m.Organization)
            .FirstOrDefaultAsync(m => m.Email == request.Email && m.PasswordHash != null, cancellationToken);

        if (member is null)
        {
            logger.LogWarning("Login failed: no member found with email {Email}", request.Email);
            return Unauthorized(new { message = "Feil e-postadresse eller passord" });
        }

        var result = passwordHasher.VerifyHashedPassword(HashTarget, member.PasswordHash!, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            logger.LogWarning("Login failed: invalid password for {Email}", request.Email);
            return Unauthorized(new { message = "Feil e-postadresse eller passord" });
        }

        if (member.Role != MemberRole.Admin)
        {
            logger.LogWarning("Login failed: member {Email} has role {Role}, admin required", request.Email, member.Role);
            return Unauthorized(new { message = "Ingen tilgang til administrasjonsgrensesnittet" });
        }

        logger.LogInformation("Login successful for {Email} (MemberId: {MemberId})", request.Email, member.Id);
        var token = jwtTokenService.GenerateToken(member.Id, member.Name, member.Email, member.Role, member.OrganizationId);

        return Ok(new TokenResponse
        {
            Token = token,
            User = MapToUserResponse(member),
        });
    }

    [HttpPost("register")]
    public async Task<ActionResult<TokenResponse>> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        logger.LogInformation("Registration attempt for organization {OrganizationName} with admin {AdminEmail}",
            request.OrganizationName, request.AdminEmail);

        var emailExists = await dbContext.Members
            .AnyAsync(m => m.Email == request.AdminEmail, cancellationToken);

        if (emailExists)
        {
            logger.LogWarning("Registration failed: email {AdminEmail} already in use", request.AdminEmail);
            return Conflict(new { message = "E-postadressen er allerede i bruk" });
        }

        var organization = new OrganizationEntity
        {
            Id = Guid.NewGuid(),
            Name = request.OrganizationName,
            Email = request.OrganizationEmail,
            Phone = request.OrganizationPhone.Replace(" ", "", StringComparison.Ordinal),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var member = new MemberEntity
        {
            Id = Guid.NewGuid(),
            Name = request.AdminName,
            Email = request.AdminEmail,
            Phone = request.AdminPhone.Replace(" ", "", StringComparison.Ordinal),
            Status = MemberStatus.Active,
            Role = MemberRole.Admin,
            PasswordHash = passwordHasher.HashPassword(HashTarget, request.Password),
            OrganizationId = organization.Id,
            JoinedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        dbContext.Organizations.Add(organization);
        dbContext.Members.Add(member);
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Registration successful: organization {OrganizationId} ({OrganizationName}), admin {MemberId} ({AdminEmail})",
            organization.Id, organization.Name, member.Id, member.Email);

        member.Organization = organization;

        var token = jwtTokenService.GenerateToken(member.Id, member.Name, member.Email, member.Role, member.OrganizationId);

        return CreatedAtAction(nameof(Me), new TokenResponse
        {
            Token = token,
            User = MapToUserResponse(member),
        });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserResponse>> Me(CancellationToken cancellationToken)
    {
        var memberId = GetMemberId();
        if (memberId is null) return Unauthorized();

        var member = await dbContext.Members
            .Include(m => m.Organization)
            .FirstOrDefaultAsync(m => m.Id == memberId, cancellationToken);

        if (member is null) return NotFound();

        return Ok(MapToUserResponse(member));
    }

    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgotPasswordRequest request,
        CancellationToken cancellationToken)
    {
        logger.LogInformation("Forgot password request for {Email}", request.Email);

        var member = await dbContext.Members
            .FirstOrDefaultAsync(m => m.Email == request.Email && m.PasswordHash != null, cancellationToken);

        if (member is null)
        {
            logger.LogInformation("Forgot password: no admin account found for {Email}", request.Email);
            return Ok(new { message = "Hvis e-postadressen finnes i systemet, vil du motta en lenke for å tilbakestille passordet." });
        }

        // Invalidate any existing unused tokens for this member
        var existingTokens = await dbContext.PasswordResetTokens
            .Where(t => t.MemberId == member.Id && !t.Used)
            .ToListAsync(cancellationToken);

        foreach (var existing in existingTokens)
        {
            existing.Used = true;
        }

        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');

        var resetToken = new PasswordResetTokenEntity
        {
            Id = Guid.NewGuid(),
            MemberId = member.Id,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            Used = false,
            CreatedAt = DateTime.UtcNow,
        };

        dbContext.PasswordResetTokens.Add(resetToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var baseUrl = configuration["App:BaseUrl"] ?? "http://localhost:3000";
        var resetUrl = $"{baseUrl}/tilbakestill-passord?token={token}";

        var htmlBody = $"""
            <h2>Tilbakestill passord</h2>
            <p>Hei {member.Name},</p>
            <p>Vi har mottatt en forespørsel om å tilbakestille passordet ditt for Medlemsvarsling.</p>
            <p><a href="{resetUrl}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Tilbakestill passord</a></p>
            <p>Lenken er gyldig i 1 time.</p>
            <p>Hvis du ikke ba om dette, kan du ignorere denne e-posten.</p>
            """;

        try
        {
            await notificationService.SendEmailAsync(
                member.Email,
                member.Name,
                "Tilbakestill passord — Medlemsvarsling",
                htmlBody,
                cancellationToken);

            logger.LogInformation("Password reset email sent to {Email}", request.Email);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send password reset email to {Email}", request.Email);
            return StatusCode(500, new { message = "Kunne ikke sende e-post. Prøv igjen senere." });
        }

        return Ok(new { message = "Hvis e-postadressen finnes i systemet, vil du motta en lenke for å tilbakestille passordet." });
    }

    [AllowAnonymous]
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        logger.LogInformation("Password reset attempt");

        var resetToken = await dbContext.PasswordResetTokens
            .Include(t => t.Member)
            .FirstOrDefaultAsync(t => t.Token == request.Token && !t.Used, cancellationToken);

        if (resetToken is null || resetToken.ExpiresAt < DateTime.UtcNow)
        {
            logger.LogWarning("Password reset failed: invalid or expired token");
            return BadRequest(new { message = "Ugyldig eller utløpt lenke. Be om en ny tilbakestilling." });
        }

        resetToken.Used = true;
        resetToken.Member.PasswordHash = passwordHasher.HashPassword(HashTarget, request.NewPassword);
        resetToken.Member.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Password reset successful for member {MemberId}", resetToken.MemberId);

        return Ok(new { message = "Passordet er tilbakestilt. Du kan nå logge inn med det nye passordet." });
    }

    private Guid? GetMemberId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;

        return Guid.TryParse(claim, out var id) ? id : null;
    }

    private static UserResponse MapToUserResponse(MemberEntity member) => new()
    {
        Id = member.Id,
        Name = member.Name,
        Email = member.Email,
        Phone = member.Phone,
        Role = member.Role,
        Organization = new OrganizationInfo
        {
            Id = member.Organization.Id,
            Name = member.Organization.Name,
            Email = member.Organization.Email,
            Phone = member.Organization.Phone,
        },
    };
}
