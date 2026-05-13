using System.Diagnostics.CodeAnalysis;

namespace Api.Infrastructure.BackgroundTasks;

[ExcludeFromCodeCoverage]
public static class BackgroundTaskExtensions
{
    public static IServiceCollection AddBackgroundTaskQueue(this IServiceCollection services)
    {
        services.AddSingleton<IBackgroundTaskQueue, BackgroundTaskQueue>();
        services.AddHostedService<QueuedHostedService>();

        return services;
    }
}
