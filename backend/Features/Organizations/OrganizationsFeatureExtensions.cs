using Api.Features.Organizations.Commands;
using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Organizations;

[ExcludeFromCodeCoverage]
public static class OrganizationsFeatureExtensions
{
    public static IServiceCollection AddOrganizationsFeature(this IServiceCollection services)
    {
        services.AddScoped<UpdateOrganizationHandler>();

        return services;
    }
}
