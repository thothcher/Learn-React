using System.Collections.Concurrent;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Refract.Api.Email;

namespace Refract.Api.Tests;

/// <summary>Hosts the real API in memory with its own SQLite database and a fake email inbox.</summary>
public sealed class ApiFactory : WebApplicationFactory<Program>
{
    public const string TeacherEmail = "teacher@refract.test";
    public const string Password = "correct horse battery";

    // A named in-memory SQLite database lives as long as one connection to it stays open.
    private readonly SqliteConnection _keepAlive =
        new($"Data Source=refract-tests-{Guid.NewGuid():N};Mode=Memory;Cache=Shared");

    private readonly Lazy<Task<HttpClient>> _teacher;

    public ApiFactory()
    {
        _keepAlive.Open();
        _teacher = new(() => this.SignedInClientAsync(TeacherEmail));
    }

    public FakeEmailService Emails { get; } = new();

    /// <summary>A signed-in client for the configured teacher account, created once per test class.</summary>
    public Task<HttpClient> TeacherClient => _teacher.Value;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("DATABASE_URL", "");
        builder.UseSetting("ConnectionStrings:Sqlite", _keepAlive.ConnectionString);
        builder.UseSetting("App:PublicUrl", "https://refract.test");
        builder.UseSetting("Auth:TeacherEmails", TeacherEmail);
        builder.UseSetting("RateLimiting:AuthPermitPerMinute", "10000");

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IEmailService>();
            services.AddSingleton<IEmailService>(Emails);
        });
    }

    /// <summary>A client that keeps cookies between requests, like a browser.</summary>
    public HttpClient CreateBrowser() =>
        CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true, AllowAutoRedirect = false });

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _keepAlive.Dispose();
    }
}

public sealed class FakeEmailService : IEmailService
{
    private readonly ConcurrentQueue<EmailMessage> _sent = new();

    public IReadOnlyList<EmailMessage> SentTo(string email) =>
        _sent.Where(message => message.To.Equals(email, StringComparison.OrdinalIgnoreCase)).ToList();

    public Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        _sent.Enqueue(message);
        return Task.CompletedTask;
    }

    /// <summary>Reads the query string of the link in the latest email sent to an address.</summary>
    public Dictionary<string, string> LatestLinkQuery(string email)
    {
        var link = Regex.Match(SentTo(email)[^1].Text, @"https://refract\.test/\S+").Value;
        return QueryHelpers.ParseQuery(new Uri(link).Query)
            .ToDictionary(pair => pair.Key, pair => pair.Value.ToString());
    }
}

public static class TestApi
{
    public static string UniqueEmail(string prefix = "student") => $"{prefix}-{Guid.NewGuid():N}@refract.test";

    public static Task<HttpResponseMessage> RegisterAsync(this HttpClient client, string email, string password = ApiFactory.Password) =>
        client.PostAsJsonAsync("/api/auth/register", new { displayName = "Ana Beridze", email, password });

    public static Task<HttpResponseMessage> LoginAsync(this HttpClient client, string email, string password = ApiFactory.Password) =>
        client.PostAsJsonAsync("/api/auth/login", new { email, password, rememberMe = false });

    public static async Task<HttpResponseMessage> ConfirmLatestEmailAsync(this HttpClient client, ApiFactory factory, string email)
    {
        var query = factory.Emails.LatestLinkQuery(email);
        return await client.PostAsJsonAsync("/api/auth/confirm-email", new { userId = query["userId"], code = query["code"] });
    }

    /// <summary>Registers, confirms and logs in; the session cookie stays on the returned client.</summary>
    public static async Task<HttpClient> SignedInClientAsync(this ApiFactory factory, string email)
    {
        var client = factory.CreateBrowser();
        (await client.RegisterAsync(email)).EnsureSuccessStatusCode();
        (await client.ConfirmLatestEmailAsync(factory, email)).EnsureSuccessStatusCode();
        (await client.LoginAsync(email)).EnsureSuccessStatusCode();
        return client;
    }

    public static async Task<JsonElement> ReadJsonAsync(this HttpResponseMessage response) =>
        await response.Content.ReadFromJsonAsync<JsonElement>();

    public static async Task<string?> ProblemCodeAsync(this HttpResponseMessage response) =>
        (await response.ReadJsonAsync()).TryGetProperty("code", out var code) ? code.GetString() : null;
}
