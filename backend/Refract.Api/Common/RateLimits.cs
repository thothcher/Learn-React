using System.Threading.RateLimiting;

namespace Refract.Api.Common;

public static class RateLimits
{
    public const string Auth = "auth";

    public static IServiceCollection AddRefractRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            // Counted per client IP and per instance: it slows down password guessing and email spam.
            options.AddPolicy(Auth, http =>
            {
                var permitLimit = http.RequestServices
                    .GetRequiredService<IConfiguration>()
                    .GetValue("RateLimiting:AuthPermitPerMinute", 10);

                return RateLimitPartition.GetFixedWindowLimiter(
                    http.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    _ => new FixedWindowRateLimiterOptions { PermitLimit = permitLimit, Window = TimeSpan.FromMinutes(1) });
            });
        });

        return services;
    }
}
