using Api.Features.Auth.Contracts;
using Api.Features.Auth.Controllers;
using Api.Infrastructure.Authentication;
using Api.Infrastructure.Database.Entities;
using Api.Infrastructure.Notifications;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;

namespace Api.Tests;

public sealed class AuthControllerTests
{
    private static AuthController BuildController(
        TestFixture fixture,
        Mock<INotificationService>? notificationMock = null,
        IConfiguration? configuration = null)
    {
        var jwtOptions = Options.Create(new JwtOptions
        {
            Key = "super-secret-test-key-that-is-at-least-32-characters-long",
            Issuer = "test-issuer",
            Audience = "test-audience",
            ExpirationMinutes = 60,
        });
        var jwtService = new JwtTokenService(jwtOptions);
        var notifier = notificationMock ?? new Mock<INotificationService>();
        var config = configuration ?? new ConfigurationBuilder().AddInMemoryCollection().Build();

        return new AuthController(
            fixture.Db,
            jwtService,
            fixture.PasswordHasher,
            notifier.Object,
            config,
            NullLogger<AuthController>.Instance);
    }

    [Fact]
    public async Task Login_WithValidAdminCredentials_ReturnsTokenResponse()
    {
        // Arrange
        var fixture = new TestFixture();
        var controller = BuildController(fixture);
        var request = new LoginRequest { Email = fixture.AdminA.Email, Password = TestFixture.AdminAPassword };

        // Act
        var result = await controller.Login(request, CancellationToken.None);

        // Assert
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var tokenResponse = Assert.IsType<TokenResponse>(ok.Value);
        Assert.False(string.IsNullOrWhiteSpace(tokenResponse.Token));
        Assert.Equal(fixture.AdminA.Email, tokenResponse.User.Email);
    }

    [Fact]
    public async Task Login_WithUnknownEmail_ReturnsUnauthorized()
    {
        // Arrange
        var fixture = new TestFixture();
        var controller = BuildController(fixture);
        var request = new LoginRequest { Email = "ukjent@test.no", Password = "noe" };

        // Act
        var result = await controller.Login(request, CancellationToken.None);

        // Assert
        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        // Arrange
        var fixture = new TestFixture();
        var controller = BuildController(fixture);
        var request = new LoginRequest { Email = fixture.AdminA.Email, Password = "feil-passord" };

        // Act
        var result = await controller.Login(request, CancellationToken.None);

        // Assert
        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task Login_AsNonAdminMember_ReturnsUnauthorized()
    {
        // Arrange
        var fixture = new TestFixture();
        var controller = BuildController(fixture);
        var request = new LoginRequest { Email = fixture.MemberA.Email, Password = "Medlem-A-Passord-789" };

        // Act
        var result = await controller.Login(request, CancellationToken.None);

        // Assert
        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task ForgotPassword_WithUnknownEmail_ReturnsOkWithoutCreatingToken()
    {
        // Arrange
        var fixture = new TestFixture();
        var notifier = new Mock<INotificationService>();
        var controller = BuildController(fixture, notifier);
        var request = new ForgotPasswordRequest { Email = "ukjent@test.no" };

        // Act
        var result = await controller.ForgotPassword(request, CancellationToken.None);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        Assert.Empty(await fixture.Db.PasswordResetTokens.ToListAsync());
        notifier.Verify(
            n => n.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task ForgotPassword_ForKnownAdmin_CreatesResetTokenAndSendsEmail()
    {
        // Arrange
        var fixture = new TestFixture();
        var notifier = new Mock<INotificationService>();
        var controller = BuildController(fixture, notifier);
        var request = new ForgotPasswordRequest { Email = fixture.AdminA.Email };

        // Act
        var result = await controller.ForgotPassword(request, CancellationToken.None);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        var token = await fixture.Db.PasswordResetTokens.SingleAsync();
        Assert.Equal(fixture.AdminA.Id, token.MemberId);
        Assert.False(token.Used);
        notifier.Verify(
            n => n.SendEmailAsync(fixture.AdminA.Email, fixture.AdminA.Name, It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task ResetPassword_WithValidToken_ResetsPasswordAndMarksTokenUsed()
    {
        // Arrange
        var fixture = new TestFixture();
        var controller = BuildController(fixture);
        var resetToken = new PasswordResetTokenEntity
        {
            Id = Guid.NewGuid(),
            MemberId = fixture.AdminA.Id,
            Token = "gyldig-token-abc",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            Used = false,
            CreatedAt = DateTime.UtcNow,
        };
        fixture.Db.PasswordResetTokens.Add(resetToken);
        await fixture.Db.SaveChangesAsync();
        var request = new ResetPasswordRequest { Token = resetToken.Token, NewPassword = "Nytt-Passord-12345" };

        // Act
        var result = await controller.ResetPassword(request, CancellationToken.None);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        var refreshed = await fixture.Db.PasswordResetTokens.FindAsync(resetToken.Id);
        Assert.True(refreshed!.Used);
        var verify = fixture.PasswordHasher.VerifyHashedPassword(TestFixture.HashTarget, fixture.AdminA.PasswordHash!, "Nytt-Passord-12345");
        Assert.NotEqual(PasswordVerificationResult.Failed, verify);
    }

    [Fact]
    public async Task ResetPassword_WithExpiredToken_ReturnsBadRequest()
    {
        // Arrange
        var fixture = new TestFixture();
        var controller = BuildController(fixture);
        var resetToken = new PasswordResetTokenEntity
        {
            Id = Guid.NewGuid(),
            MemberId = fixture.AdminA.Id,
            Token = "utlopt-token",
            ExpiresAt = DateTime.UtcNow.AddHours(-1),
            Used = false,
            CreatedAt = DateTime.UtcNow.AddHours(-2),
        };
        fixture.Db.PasswordResetTokens.Add(resetToken);
        await fixture.Db.SaveChangesAsync();
        var request = new ResetPasswordRequest { Token = resetToken.Token, NewPassword = "Nytt-Passord-12345" };

        // Act
        var result = await controller.ResetPassword(request, CancellationToken.None);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task ResetPassword_WithAlreadyUsedToken_ReturnsBadRequest()
    {
        // Arrange
        var fixture = new TestFixture();
        var controller = BuildController(fixture);
        var resetToken = new PasswordResetTokenEntity
        {
            Id = Guid.NewGuid(),
            MemberId = fixture.AdminA.Id,
            Token = "brukt-token",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            Used = true,
            CreatedAt = DateTime.UtcNow,
        };
        fixture.Db.PasswordResetTokens.Add(resetToken);
        await fixture.Db.SaveChangesAsync();
        var request = new ResetPasswordRequest { Token = resetToken.Token, NewPassword = "Nytt-Passord-12345" };

        // Act
        var result = await controller.ResetPassword(request, CancellationToken.None);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }
}
