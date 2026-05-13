using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Auth.Contracts;

[ExcludeFromCodeCoverage]
public sealed record ResetPasswordRequest
{
    [Required]
    public required string Token { get; init; }

    [Required]
    [MinLength(8)]
    public required string NewPassword { get; init; }
}
