using Api.Features.Settings.Contracts;
using Api.Features.Settings.Queries;
using Api.Features.Settings.Commands;
using Microsoft.AspNetCore.Mvc;

namespace Api.Features.Settings.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class SettingsController(
    GetSettingsHandler getSettingsHandler,
    UpdateSettingsHandler updateSettingsHandler) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<SettingsResponse>> Get(CancellationToken cancellationToken)
    {
        var settings = await getSettingsHandler.HandleAsync(cancellationToken);

        if (settings is null)
        {
            return NotFound();
        }

        return Ok(settings);
    }

    [HttpPut]
    public async Task<ActionResult<SettingsResponse>> Update([FromBody] UpdateSettingsRequest request, CancellationToken cancellationToken)
    {
        var settings = await updateSettingsHandler.HandleAsync(request, cancellationToken);
        return Ok(settings);
    }
}
