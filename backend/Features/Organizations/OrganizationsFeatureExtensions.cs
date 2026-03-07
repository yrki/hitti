using Api.Features.Organizations.Commands;

namespace Api.Features.Organizations;

public static class OrganizationsFeatureExtensions
{
    public static IServiceCollection AddOrganizationsFeature(this IServiceCollection services)
    {
        services.AddScoped<UpdateOrganizationHandler>();

        return services;
    }
}
