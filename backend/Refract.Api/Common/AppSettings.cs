namespace Refract.Api.Common;

public sealed class AppSettings
{
    /// <summary>Public address of the site, used to build links in emails.</summary>
    public string PublicUrl { get; set; } = "";
}

public static class AppSettingsSetup
{
    public static IServiceCollection AddRefractAppSettings(this IServiceCollection services)
    {
        services.AddOptions<AppSettings>()
            .BindConfiguration("App")
            .PostConfigure<IConfiguration>((settings, config) =>
            {
                // Email links are never built from the request's Host header, because it can be spoofed.
                if (string.IsNullOrWhiteSpace(settings.PublicUrl) && config["VERCEL_PROJECT_PRODUCTION_URL"] is { Length: > 0 } host)
                {
                    settings.PublicUrl = $"https://{host}";
                }
                settings.PublicUrl = settings.PublicUrl.TrimEnd('/');
            })
            .Validate(settings => Uri.IsWellFormedUriString(settings.PublicUrl, UriKind.Absolute), "App:PublicUrl must be an absolute URL.")
            .ValidateOnStart();

        return services;
    }
}
