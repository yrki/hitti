using System.Security.Claims;
using Api.Features.Organizations.Commands;
using Api.Features.Organizations.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Features.Organizations.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class OrganizationsController(
    UpdateOrganizationHandler updateOrganizationHandler) : ControllerBase
{
    [HttpPut]
    public async Task<ActionResult<UpdateOrganizationResponse>> Update(
        [FromBody] UpdateOrganizationRequest request,
        CancellationToken cancellationToken)
    {
        var orgId = GetOrganizationId();
        if (orgId is null) return Unauthorized();

        var organization = await updateOrganizationHandler.HandleAsync(orgId.Value, request, cancellationToken);
        if (organization is null) return NotFound();

        return Ok(organization);
    }

    private Guid? GetOrganizationId()
    {
        var claim = User.FindFirst("org")?.Value;
        return Guid.TryParse(claim, out var orgId) ? orgId : null;
    }
}
