using Api.Features.Weather.Services;

namespace Api.Features.Weather;

public static class WeatherFeatureExtensions
{
    public static IServiceCollection AddWeatherFeature(this IServiceCollection services)
    {
        services.AddScoped<IWeatherService, WeatherService>();
        return services;
    }
}
