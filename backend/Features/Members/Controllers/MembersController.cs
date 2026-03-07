using System.Security.Claims;
using Api.Features.Members.Commands;
using Api.Features.Members.Contracts;
using Api.Features.Members.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Features.Members.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public sealed class MembersController(
    GetAllMembersHandler getAllMembersHandler,
    GetMemberByIdHandler getMemberByIdHandler,
    CreateMemberHandler createMemberHandler,
    UpdateMemberHandler updateMemberHandler,
    DeleteMemberHandler deleteMemberHandler) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MemberResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var orgId = GetOrganizationId();
        if (orgId is null) return Unauthorized();

        var members = await getAllMembersHandler.HandleAsync(orgId.Value, cancellationToken);
        return Ok(members);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MemberResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var orgId = GetOrganizationId();
        if (orgId is null) return Unauthorized();

        var member = await getMemberByIdHandler.HandleAsync(id, orgId.Value, cancellationToken);

        if (member is null)
        {
            return NotFound();
        }

        return Ok(member);
    }

    [HttpPost]
    public async Task<ActionResult<MemberResponse>> Create([FromBody] CreateMemberRequest request, CancellationToken cancellationToken)
    {
        var orgId = GetOrganizationId();
        if (orgId is null) return Unauthorized();

        var member = await createMemberHandler.HandleAsync(orgId.Value, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = member.Id }, member);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<MemberResponse>> Update(Guid id, [FromBody] UpdateMemberRequest request, CancellationToken cancellationToken)
    {
        var orgId = GetOrganizationId();
        if (orgId is null) return Unauthorized();

        var member = await updateMemberHandler.HandleAsync(id, orgId.Value, request, cancellationToken);

        if (member is null)
        {
            return NotFound();
        }

        return Ok(member);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var orgId = GetOrganizationId();
        if (orgId is null) return Unauthorized();

        var deleted = await deleteMemberHandler.HandleAsync(id, orgId.Value, cancellationToken);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    private Guid? GetOrganizationId()
    {
        var claim = User.FindFirst("org")?.Value;
        return Guid.TryParse(claim, out var orgId) ? orgId : null;
    }
}
