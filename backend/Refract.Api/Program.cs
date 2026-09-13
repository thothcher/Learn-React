using Microsoft.AspNetCore.HttpOverrides;
using Refract.Api.Auth;
using Refract.Api.Common;
using Refract.Api.Data;
using Refract.Api.Email;
using Refract.Api.Progress;
using Refract.Api.Teacher;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Vercel starts the container with PORT set (80 unless configured) and sends traffic to it.
if (Environment.GetEnvironmentVariable("PORT") is { Length: > 0 } port)
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.AddRefractAppSettings();
builder.Services.AddRefractDatabase();
builder.Services.AddRefractAuth(builder.Environment);
builder.Services.AddRefractEmail();
builder.Services.AddRefractRateLimiting();
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // The container is only reachable through Vercel's proxy, so trust the headers it adds.
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

app.UseForwardedHeaders();
app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseRouting();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    // Interactive API docs at http://localhost:5080/scalar
    app.MapOpenApi();
    app.MapScalarApiReference();
}

var api = app.MapGroup("/api");
api.MapGet("/health", () => Results.Ok(new { status = "ok" }));
api.MapAuthEndpoints();
api.MapProgressEndpoints();
api.MapTeacherEndpoints();

await app.Services.InitializeDatabaseAsync();
app.Run();

// Lets the integration tests host the app with WebApplicationFactory<Program>.
public partial class Program { }
