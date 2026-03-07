using Api.Features.Activities.Commands;
using Api.Features.Activities.Contracts;
using Api.Features.Activities.Queries;
using Microsoft.AspNetCore.Mvc;

namespace Api.Features.Activities.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ActivitiesController(
    GetAllActivitiesHandler getAllActivitiesHandler,
    GetActivityByIdHandler getActivityByIdHandler,
    CreateActivityHandler createActivityHandler,
    UpdateActivityHandler updateActivityHandler,
    DeleteActivityHandler deleteActivityHandler) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ActivityResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var activities = await getAllActivitiesHandler.HandleAsync(cancellationToken);
        return Ok(activities);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ActivityResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var activity = await getActivityByIdHandler.HandleAsync(id, cancellationToken);

        if (activity is null)
        {
            return NotFound();
        }

        return Ok(activity);
    }

    [HttpPost]
    public async Task<ActionResult<ActivityResponse>> Create([FromBody] CreateActivityRequest request, CancellationToken cancellationToken)
    {
        var activity = await createActivityHandler.HandleAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = activity.Id }, activity);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ActivityResponse>> Update(Guid id, [FromBody] UpdateActivityRequest request, CancellationToken cancellationToken)
    {
        var activity = await updateActivityHandler.HandleAsync(id, request, cancellationToken);

        if (activity is null)
        {
            return NotFound();
        }

        return Ok(activity);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await deleteActivityHandler.HandleAsync(id, cancellationToken);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
