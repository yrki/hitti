using System.ComponentModel.DataAnnotations;

namespace Api.Features.Auth.Contracts;

public sealed record ForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    public required string Email { get; init; }
}
