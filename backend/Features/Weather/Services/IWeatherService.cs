using Api.Features.Weather.Contracts;

namespace Api.Features.Weather.Services;

public interface IWeatherService
{
    IReadOnlyList<WeatherForecastResponse> GetForecast(int days);
}
