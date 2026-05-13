using Api.Features.Weather.Services;
using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Weather;

[ExcludeFromCodeCoverage]
public static class WeatherFeatureExtensions
{
    public static IServiceCollection AddWeatherFeature(this IServiceCollection services)
    {
        services.AddScoped<IWeatherService, WeatherService>();
        return services;
    }
}
