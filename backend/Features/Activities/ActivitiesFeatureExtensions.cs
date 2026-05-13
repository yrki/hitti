using Api.Features.Activities.Commands;
using Api.Features.Activities.Queries;
using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Activities;

[ExcludeFromCodeCoverage]
public static class ActivitiesFeatureExtensions
{
    public static IServiceCollection AddActivitiesFeature(this IServiceCollection services)
    {
        services.AddScoped<GetAllActivitiesHandler>();
        services.AddScoped<GetActivityByIdHandler>();
        services.AddScoped<CreateActivityHandler>();
        services.AddScoped<UpdateActivityHandler>();
        services.AddScoped<DeleteActivityHandler>();
        services.AddScoped<SendInvitationsHandler>();
        services.AddScoped<RespondToInvitationHandler>();
        services.AddScoped<ResendInvitationHandler>();
        services.AddScoped<GetActivityParticipantsHandler>();
        services.AddScoped<GetUpcomingActivitiesHandler>();

        return services;
    }
}
