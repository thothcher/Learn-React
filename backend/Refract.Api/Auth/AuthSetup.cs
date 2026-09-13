using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Refract.Api.Data;

namespace Refract.Api.Auth;

public static class Roles
{
    public const string Teacher = "Teacher";
}

public static class Policies
{
    public const string Teacher = "Teacher";
}

public sealed class AuthSettings
{
    /// <summary>Comma-separated emails that receive the Teacher role once they are confirmed.</summary>
    public string TeacherEmails { get; set; } = "";

    public bool IsTeacherEmail(string? email) =>
        email is not null && TeacherEmails
            .Split([',', ';'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Contains(email.Trim(), StringComparer.OrdinalIgnoreCase);
}

public static class AuthSetup
{
    public static IServiceCollection AddRefractAuth(this IServiceCollection services, IHostEnvironment environment)
    {
        services.AddIdentity<AppUser, IdentityRole<Guid>>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.SignIn.RequireConfirmedEmail = true;

                // Length matters more than composition rules: 8+ characters, anything allowed.
                options.Password.RequiredLength = 8;
                options.Password.RequireDigit = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;

                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();

        // Links in confirmation and password reset emails expire after three hours.
        services.Configure<DataProtectionTokenProviderOptions>(options => options.TokenLifespan = TimeSpan.FromHours(3));

        // Sessions re-check the security stamp, so resetting a password signs out other devices.
        services.Configure<SecurityStampValidatorOptions>(options => options.ValidationInterval = TimeSpan.FromMinutes(10));

        services.ConfigureApplicationCookie(options =>
        {
            options.Cookie.Name = "refract.session";
            options.Cookie.HttpOnly = true;
            // The React app and the API share one domain, so Lax works and blocks cross-site form posts.
            options.Cookie.SameSite = SameSiteMode.Lax;
            options.Cookie.SecurePolicy = environment.IsProduction() ? CookieSecurePolicy.Always : CookieSecurePolicy.SameAsRequest;
            options.ExpireTimeSpan = TimeSpan.FromDays(14);
            options.SlidingExpiration = true;

            // An API answers with status codes instead of redirecting to a login page.
            options.Events.OnRedirectToLogin = context =>
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            };
            options.Events.OnRedirectToAccessDenied = context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return Task.CompletedTask;
            };
        });

        services.AddDataProtection()
            .SetApplicationName("Refract")
            .PersistKeysToDbContext<AppDbContext>();

        services.AddAuthorizationBuilder()
            .AddPolicy(Policies.Teacher, policy => policy.RequireRole(Roles.Teacher));

        services.AddOptions<AuthSettings>().BindConfiguration("Auth");
        services.AddScoped<TeacherRoles>();
        services.AddMemoryCache();
        services.AddScoped<AccountEmails>();

        return services;
    }
}
