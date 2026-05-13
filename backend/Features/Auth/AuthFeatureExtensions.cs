using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Auth;

[ExcludeFromCodeCoverage]
public static class AuthFeatureExtensions
{
    public static IServiceCollection AddAuthFeature(this IServiceCollection services)
    {
        return services;
    }
}
