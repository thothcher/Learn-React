using System.Net;
using System.Net.Http.Json;
using Refract.Api.Auth;

namespace Refract.Api.Tests;

public sealed class AuthTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task Register_confirm_login_and_logout()
    {
        var client = factory.CreateBrowser();
        var email = TestApi.UniqueEmail();

        var register = await client.RegisterAsync(email);
        Assert.Equal(HttpStatusCode.Created, register.StatusCode);
        Assert.Single(factory.Emails.SentTo(email));

        var beforeConfirming = await client.LoginAsync(email);
        Assert.Equal(HttpStatusCode.Forbidden, beforeConfirming.StatusCode);
        Assert.Equal("EmailNotConfirmed", await beforeConfirming.ProblemCodeAsync());

        Assert.Equal(HttpStatusCode.NoContent, (await client.ConfirmLatestEmailAsync(factory, email)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.LoginAsync(email)).StatusCode);

        var me = await client.GetFromJsonAsync<UserResponse>("/api/auth/me");
        Assert.NotNull(me);
        Assert.Equal(email, me.Email);
        Assert.Equal("Ana Beridze", me.DisplayName);
        Assert.False(me.IsTeacher);

        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsync("/api/auth/logout", null)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/auth/me")).StatusCode);
    }

    [Fact]
    public async Task Wrong_password_does_not_reveal_an_unconfirmed_account()
    {
        var client = factory.CreateBrowser();
        var email = TestApi.UniqueEmail();
        await client.RegisterAsync(email);

        var response = await client.LoginAsync(email, "not the password");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("InvalidCredentials", await response.ProblemCodeAsync());
    }

    [Fact]
    public async Task Registering_the_same_email_twice_is_a_field_error()
    {
        var client = factory.CreateBrowser();
        var email = TestApi.UniqueEmail();
        await client.RegisterAsync(email);

        var response = await client.RegisterAsync(email);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var errors = (await response.ReadJsonAsync()).GetProperty("errors");
        Assert.Equal("An account with this email already exists.", errors.GetProperty("email")[0].GetString());
    }

    [Fact]
    public async Task Invalid_registration_input_is_rejected_per_field()
    {
        var client = factory.CreateBrowser();

        var response = await client.PostAsJsonAsync("/api/auth/register", new { displayName = "", email = "not-an-email", password = "short" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var errors = (await response.ReadJsonAsync()).GetProperty("errors");
        Assert.True(errors.TryGetProperty("displayName", out _));
        Assert.True(errors.TryGetProperty("email", out _));

        var shortPassword = await client.RegisterAsync(TestApi.UniqueEmail(), "short");
        Assert.Equal(HttpStatusCode.BadRequest, shortPassword.StatusCode);
        Assert.True((await shortPassword.ReadJsonAsync()).GetProperty("errors").TryGetProperty("password", out _));
    }

    [Fact]
    public async Task Password_reset_replaces_the_password_and_the_link_works_once()
    {
        var email = TestApi.UniqueEmail();
        await factory.SignedInClientAsync(email);
        var client = factory.CreateBrowser();

        var forgot = await client.PostAsJsonAsync("/api/auth/forgot-password", new { email });
        Assert.Equal(HttpStatusCode.Accepted, forgot.StatusCode);

        var link = factory.Emails.LatestLinkQuery(email);
        Assert.Equal(email, link["email"]);

        const string newPassword = "a brand new passphrase";
        var reset = await client.PostAsJsonAsync("/api/auth/reset-password", new { email, code = link["code"], password = newPassword });
        Assert.Equal(HttpStatusCode.NoContent, reset.StatusCode);

        Assert.Equal(HttpStatusCode.Unauthorized, (await client.LoginAsync(email)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.LoginAsync(email, newPassword)).StatusCode);

        var reuse = await client.PostAsJsonAsync("/api/auth/reset-password", new { email, code = link["code"], password = "another passphrase" });
        Assert.Equal(HttpStatusCode.BadRequest, reuse.StatusCode);
        Assert.Equal("InvalidLink", await reuse.ProblemCodeAsync());
    }

    [Fact]
    public async Task Forgot_password_answers_the_same_for_unknown_emails()
    {
        var client = factory.CreateBrowser();
        var email = TestApi.UniqueEmail("nobody");

        var response = await client.PostAsJsonAsync("/api/auth/forgot-password", new { email });

        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
        Assert.Empty(factory.Emails.SentTo(email));
    }

    [Fact]
    public async Task Account_locks_after_five_failed_logins()
    {
        var email = TestApi.UniqueEmail();
        await factory.SignedInClientAsync(email);
        var client = factory.CreateBrowser();

        for (var attempt = 1; attempt <= 4; attempt++)
        {
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.LoginAsync(email, "wrong password")).StatusCode);
        }

        Assert.Equal(HttpStatusCode.Locked, (await client.LoginAsync(email, "wrong password")).StatusCode);

        var correctPassword = await client.LoginAsync(email);
        Assert.Equal(HttpStatusCode.Locked, correctPassword.StatusCode);
        Assert.Equal("LockedOut", await correctPassword.ProblemCodeAsync());
    }

    [Fact]
    public async Task A_tampered_confirmation_code_is_rejected()
    {
        var client = factory.CreateBrowser();
        var email = TestApi.UniqueEmail();
        await client.RegisterAsync(email);
        var link = factory.Emails.LatestLinkQuery(email);

        var response = await client.PostAsJsonAsync("/api/auth/confirm-email", new { userId = link["userId"], code = link["code"] + "x" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("InvalidLink", await response.ProblemCodeAsync());
    }

    [Fact]
    public async Task Confirming_with_the_same_link_twice_at_once_succeeds_both_times()
    {
        var email = TestApi.UniqueEmail();
        await factory.CreateBrowser().RegisterAsync(email);
        var link = factory.Emails.LatestLinkQuery(email);
        var body = new { userId = link["userId"], code = link["code"] };

        var responses = await Task.WhenAll(
            factory.CreateBrowser().PostAsJsonAsync("/api/auth/confirm-email", body),
            factory.CreateBrowser().PostAsJsonAsync("/api/auth/confirm-email", body));

        Assert.All(responses, response => Assert.Equal(HttpStatusCode.NoContent, response.StatusCode));
        Assert.Equal(HttpStatusCode.OK, (await factory.CreateBrowser().LoginAsync(email)).StatusCode);
    }

    [Fact]
    public async Task Repeated_email_requests_are_throttled_per_account()
    {
        var client = factory.CreateBrowser();
        var email = TestApi.UniqueEmail();
        await client.RegisterAsync(email);

        for (var attempt = 0; attempt < 3; attempt++)
        {
            var response = await client.PostAsJsonAsync("/api/auth/resend-confirmation", new { email });
            Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
        }

        Assert.Single(factory.Emails.SentTo(email));
    }
}
