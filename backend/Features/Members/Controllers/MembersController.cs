using Api.Features.Members.Commands;
using Api.Features.Members.Contracts;
using Api.Features.Members.Queries;
using Microsoft.AspNetCore.Mvc;

namespace Api.Features.Members.Controllers;

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
        var members = await getAllMembersHandler.HandleAsync(cancellationToken);
        return Ok(members);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MemberResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var member = await getMemberByIdHandler.HandleAsync(id, cancellationToken);

        if (member is null)
        {
            return NotFound();
        }

        return Ok(member);
    }

    [HttpPost]
    public async Task<ActionResult<MemberResponse>> Create([FromBody] CreateMemberRequest request, CancellationToken cancellationToken)
    {
        var member = await createMemberHandler.HandleAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = member.Id }, member);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<MemberResponse>> Update(Guid id, [FromBody] UpdateMemberRequest request, CancellationToken cancellationToken)
    {
        var member = await updateMemberHandler.HandleAsync(id, request, cancellationToken);

        if (member is null)
        {
            return NotFound();
        }

        return Ok(member);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await deleteMemberHandler.HandleAsync(id, cancellationToken);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
