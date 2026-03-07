namespace Api.Infrastructure.Notifications;

public static class NotificationExtensions
{
    public static IServiceCollection AddNotifications(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<AzureCommunicationOptions>(configuration.GetSection("AzureCommunication"));
        services.AddSingleton<INotificationService, AzureNotificationService>();

        return services;
    }
}
