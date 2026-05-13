using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Auth.Contracts;

[ExcludeFromCodeCoverage]
public sealed record ForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    public required string Email { get; init; }
}
