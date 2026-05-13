using System.Diagnostics.CodeAnalysis;

namespace Api.Infrastructure.Authentication;

[ExcludeFromCodeCoverage]
public sealed class JwtOptions
{
    public required string Key { get; set; }
    public required string Issuer { get; set; }
    public required string Audience { get; set; }
    public int ExpirationMinutes { get; set; } = 480;
}
