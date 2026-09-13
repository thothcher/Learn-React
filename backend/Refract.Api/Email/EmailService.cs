using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.Options;

namespace Refract.Api.Email;

public sealed record EmailMessage(string To, string Subject, string Html, string Text);

public interface IEmailService
{
    Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default);
}

public sealed class EmailSettings
{
    public string From { get; set; } = "";
    public string ResendApiKey { get; set; } = "";
}

/// <summary>Sends email through the Resend HTTP API.</summary>
public sealed class ResendEmailService(HttpClient http, IOptions<EmailSettings> settings) : IEmailService
{
    public async Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "emails")
        {
            Content = JsonContent.Create(new
            {
                from = settings.Value.From,
                to = new[] { message.To },
                subject = message.Subject,
                html = message.Html,
                text = message.Text,
            }),
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", settings.Value.ResendApiKey);

        using var response = await http.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException($"Resend rejected the email ({(int)response.StatusCode}): {body}");
        }
    }
}

/// <summary>Used when no Resend API key is configured. In development the email, including its link, goes to the console.</summary>
public sealed class LogEmailService(ILogger<LogEmailService> logger, IHostEnvironment environment) : IEmailService
{
    public Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        if (environment.IsDevelopment())
        {
            logger.LogWarning("Email not sent (no Resend API key). To: {To} | Subject: {Subject}\n{Text}", message.To, message.Subject, message.Text);
        }
        else
        {
            // Links carry secret tokens, so they never go to production logs.
            logger.LogError("Email \"{Subject}\" was not sent: set Email__ResendApiKey or RESEND_API_KEY.", message.Subject);
        }
        return Task.CompletedTask;
    }
}

public static class EmailSetup
{
    public static IServiceCollection AddRefractEmail(this IServiceCollection services)
    {
        services.AddOptions<EmailSettings>()
            .BindConfiguration("Email")
            .PostConfigure<IConfiguration>((settings, config) =>
            {
                // The Resend integration on Vercel provides RESEND_API_KEY.
                if (string.IsNullOrWhiteSpace(settings.ResendApiKey))
                {
                    settings.ResendApiKey = config["RESEND_API_KEY"] ?? "";
                }
            });

        services.AddHttpClient<ResendEmailService>(client => client.BaseAddress = new Uri("https://api.resend.com/"));
        services.AddSingleton<LogEmailService>();
        services.AddScoped<IEmailService>(provider =>
            string.IsNullOrWhiteSpace(provider.GetRequiredService<IOptions<EmailSettings>>().Value.ResendApiKey)
                ? provider.GetRequiredService<LogEmailService>()
                : provider.GetRequiredService<ResendEmailService>());

        return services;
    }
}
