using Api.Features.Activities;
using Api.Features.Auth;
using Api.Features.Members;
using Api.Features.Organizations;
using Api.Features.Weather;
using Api.Infrastructure.Authentication;
using Api.Infrastructure.BackgroundTasks;
using Api.Infrastructure.Database;
using Api.Infrastructure.Notifications;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// Infrastructure
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddNotifications(builder.Configuration);
builder.Services.AddBackgroundTaskQueue();

// Features
builder.Services.AddWeatherFeature();
builder.Services.AddMembersFeature();
builder.Services.AddActivitiesFeature();
builder.Services.AddAuthFeature();
builder.Services.AddOrganizationsFeature();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "Hitti API");
    });
    await app.ApplyMigrationsAsync();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
