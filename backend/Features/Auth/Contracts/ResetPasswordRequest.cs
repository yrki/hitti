using System.ComponentModel.DataAnnotations;

namespace Api.Features.Auth.Contracts;

public sealed record ResetPasswordRequest
{
    [Required]
    public required string Token { get; init; }

    [Required]
    [MinLength(8)]
    public required string NewPassword { get; init; }
}
