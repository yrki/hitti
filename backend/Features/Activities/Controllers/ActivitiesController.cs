using System.Security.Claims;
using Api.Features.Activities.Commands;
using Api.Features.Activities.Contracts;
using Api.Features.Activities.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Features.Activities.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public sealed class ActivitiesController(
    GetAllActivitiesHandler getAllActivitiesHandler,
    GetActivityByIdHandler getActivityByIdHandler,
    CreateActivityHandler createActivityHandler,
    UpdateActivityHandler updateActivityHandler,
    DeleteActivityHandler deleteActivityHandler,
    SendInvitationsHandler sendInvitationsHandler,
    GetActivityParticipantsHandler getActivityParticipantsHandler,
    GetUpcomingActivitiesHandler getUpcomingActivitiesHandler,
    ResendInvitationHandler resendInvitationHandler) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ActivityResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var activities = await getAllActivitiesHandler.HandleAsync(cancellationToken);
        return Ok(activities);
    }

    [HttpGet("upcoming")]
    public async Task<ActionResult<IReadOnlyList<UpcomingActivityResponse>>> GetUpcoming(
        [FromQuery] int count = 5,
        CancellationToken cancellationToken = default)
    {
        var activities = await getUpcomingActivitiesHandler.HandleAsync(count, cancellationToken);
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

    [HttpPost("{id:guid}/invitations")]
    public async Task<ActionResult<SendInvitationsResponse>> SendInvitations(
        Guid id,
        [FromBody] SendInvitationsRequest request,
        CancellationToken cancellationToken)
    {
        var organizationId = GetOrganizationId();
        if (organizationId is null) return Unauthorized();

        var result = await sendInvitationsHandler.HandleAsync(id, organizationId.Value, request.Channel, cancellationToken);

        if (result is null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpGet("{id:guid}/participants")]
    public async Task<ActionResult<IReadOnlyList<ParticipantResponse>>> GetParticipants(
        Guid id,
        CancellationToken cancellationToken)
    {
        var participants = await getActivityParticipantsHandler.HandleAsync(id, cancellationToken);

        if (participants is null)
        {
            return NotFound();
        }

        return Ok(participants);
    }

    [HttpPost("{id:guid}/participants/{participantId:guid}/resend")]
    public async Task<IActionResult> ResendInvitation(Guid id, Guid participantId, CancellationToken cancellationToken)
    {
        var organizationId = GetOrganizationId();
        if (organizationId is null) return Unauthorized();

        var ok = await resendInvitationHandler.HandleAsync(id, participantId, organizationId.Value, cancellationToken);

        if (!ok) return NotFound();

        return NoContent();
    }

    private Guid? GetOrganizationId()
    {
        var claim = User.FindFirst("org")?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
