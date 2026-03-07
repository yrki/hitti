using Api.Features.Weather.Contracts;
using Api.Features.Weather.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api.Features.Weather.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class WeatherController(IWeatherService weatherService) : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyList<WeatherForecastResponse>> Get([FromQuery] int days = 5)
    {
        if (days is < 1 or > 14)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid parameter",
                Detail = "Days must be between 1 and 14."
            });
        }

        var forecast = weatherService.GetForecast(days);
        return Ok(forecast);
    }
}
