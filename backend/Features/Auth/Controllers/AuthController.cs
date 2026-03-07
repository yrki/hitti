using System.Security.Claims;
using Api.Features.Auth.Contracts;
using Api.Infrastructure.Authentication;
using Api.Infrastructure.Database;
using Api.Infrastructure.Database.Entities;
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

        if (member.Role != "admin")
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
            Phone = request.OrganizationPhone,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var member = new MemberEntity
        {
            Id = Guid.NewGuid(),
            Name = request.AdminName,
            Email = request.AdminEmail,
            Phone = request.AdminPhone,
            Status = "active",
            Role = "admin",
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
