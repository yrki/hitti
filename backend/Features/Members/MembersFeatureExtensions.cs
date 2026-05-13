using Api.Features.Members.Commands;
using Api.Features.Members.Queries;
using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Members;

[ExcludeFromCodeCoverage]
public static class MembersFeatureExtensions
{
    public static IServiceCollection AddMembersFeature(this IServiceCollection services)
    {
        services.AddScoped<GetAllMembersHandler>();
        services.AddScoped<GetMemberByIdHandler>();
        services.AddScoped<CreateMemberHandler>();
        services.AddScoped<UpdateMemberHandler>();
        services.AddScoped<DeleteMemberHandler>();

        return services;
    }
}
