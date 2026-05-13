using Api.Features.Weather.Contracts;
using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Weather.Services;

public interface IWeatherService
{
    IReadOnlyList<WeatherForecastResponse> GetForecast(int days);
}
