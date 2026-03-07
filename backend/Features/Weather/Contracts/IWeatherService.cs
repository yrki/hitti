namespace Api.Features.Weather.Contracts;

public interface IWeatherService
{
    IReadOnlyList<WeatherForecastResponse> GetForecast(int days);
}
