using Api.Features.Activities.Commands;
using Microsoft.AspNetCore.Mvc;

namespace Api.Features.Activities.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class RsvpController(RespondToInvitationHandler respondToInvitationHandler) : ControllerBase
{
    [HttpGet("{token}")]
    public async Task<ActionResult<RespondResult>> Respond(
        string token,
        [FromQuery(Name = "svar")] string response,
        CancellationToken cancellationToken)
    {
        if (response is not ("ja" or "nei"))
        {
            return BadRequest(new { message = "Ugyldig svar. Bruk 'ja' eller 'nei'." });
        }

        var result = await respondToInvitationHandler.HandleAsync(token, response, cancellationToken);

        if (result is null)
        {
            return NotFound(new { message = "Ugyldig eller utløpt invitasjonslenke." });
        }

        return Ok(result);
    }
}
