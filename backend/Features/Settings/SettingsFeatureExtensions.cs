using Api.Features.Settings.Commands;
using Api.Features.Settings.Queries;

namespace Api.Features.Settings;

public static class SettingsFeatureExtensions
{
    public static IServiceCollection AddSettingsFeature(this IServiceCollection services)
    {
        services.AddScoped<GetSettingsHandler>();
        services.AddScoped<UpdateSettingsHandler>();

        return services;
    }
}
