using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Npgsql;
using Refract.Api.Auth;
using Refract.Api.Data;
using Refract.Api.Teacher;

namespace Refract.Api.Tests;

public sealed class TeacherTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task Teacher_sees_students_with_their_progress()
    {
        var studentEmail = TestApi.UniqueEmail();
        var student = await factory.SignedInClientAsync(studentEmail);
        await student.PutAsync("/api/progress/lessons/props", null);
        await student.PutAsync("/api/progress/projects/1", null);
        await student.PostAsJsonAsync("/api/progress/scores", new { key = "quiz:week-1", score = 85 });
        await student.PostAsJsonAsync("/api/progress/scores", new { key = "quiz:week-2", score = 40 });

        var teacher = await factory.TeacherClient;
        var me = await teacher.GetFromJsonAsync<UserResponse>("/api/auth/me");
        Assert.True(me!.IsTeacher);

        var students = await teacher.GetFromJsonAsync<List<StudentSummary>>("/api/teacher/students");
        Assert.NotNull(students);
        Assert.DoesNotContain(students, summary => summary.Email == ApiFactory.TeacherEmail);

        var summary = students.Single(s => s.Email == studentEmail);
        Assert.Equal(1, summary.LessonsCompleted);
        Assert.Equal(1, summary.ProjectsCompleted);
        Assert.Equal(1, summary.TestsPassed);
        Assert.NotNull(summary.LastActiveAt);

        var detail = await teacher.GetFromJsonAsync<StudentDetail>($"/api/teacher/students/{summary.Id}");
        Assert.Equal("props", detail!.Progress.Lessons.Single().Slug);

        var missing = await teacher.GetAsync($"/api/teacher/students/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
    }

    [Fact]
    public async Task Students_and_visitors_cannot_open_the_teacher_dashboard()
    {
        var student = await factory.SignedInClientAsync(TestApi.UniqueEmail());

        Assert.Equal(HttpStatusCode.Forbidden, (await student.GetAsync("/api/teacher/students")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await factory.CreateBrowser().GetAsync("/api/teacher/students")).StatusCode);
    }

    [Fact]
    public async Task Removing_a_teacher_email_revokes_access_on_the_next_page_load()
    {
        var email = TestApi.UniqueEmail("teacher");

        // Same database and encryption keys, but a configuration where this email is a teacher.
        using var teacherConfig = factory.WithWebHostBuilder(builder => builder.UseSetting("Auth:TeacherEmails", email));
        var before = teacherConfig.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });

        (await before.RegisterAsync(email)).EnsureSuccessStatusCode();
        (await before.ConfirmLatestEmailAsync(factory, email)).EnsureSuccessStatusCode();
        var login = await before.LoginAsync(email);
        login.EnsureSuccessStatusCode();
        Assert.True((await login.Content.ReadFromJsonAsync<UserResponse>())!.IsTeacher);

        // The email is no longer listed; the browser still holds the teacher-era cookie.
        var after = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var me = await SendWithCookieAsync(after, "/api/auth/me", SessionCookie(login));
        Assert.False((await me.Content.ReadFromJsonAsync<UserResponse>())!.IsTeacher);

        var students = await SendWithCookieAsync(after, "/api/teacher/students", SessionCookie(me));
        Assert.Equal(HttpStatusCode.Forbidden, students.StatusCode);
    }

    private static string SessionCookie(HttpResponseMessage response) =>
        response.Headers.GetValues("Set-Cookie")
            .Select(header => header.Split(';')[0])
            .Single(cookie => cookie.StartsWith("refract.session=", StringComparison.Ordinal));

    private static Task<HttpResponseMessage> SendWithCookieAsync(HttpClient client, string path, string cookie)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, path);
        request.Headers.Add("Cookie", cookie);
        return client.SendAsync(request);
    }
}

public sealed class DatabaseSettingsTests
{
    [Fact]
    public void Postgres_urls_become_npgsql_connection_strings()
    {
        var connectionString = PostgresConnectionString.Normalize(
            "postgresql://ana:p%40ss@ep-cool-rain-123.eu-central-1.aws.neon.tech/refract?sslmode=require&channel_binding=require");

        var parsed = new NpgsqlConnectionStringBuilder(connectionString);
        Assert.Equal("ep-cool-rain-123.eu-central-1.aws.neon.tech", parsed.Host);
        Assert.Equal(5432, parsed.Port);
        Assert.Equal("refract", parsed.Database);
        Assert.Equal("ana", parsed.Username);
        Assert.Equal("p@ss", parsed.Password);
        Assert.Equal(SslMode.Require, parsed.SslMode);
        Assert.Equal(ChannelBinding.Require, parsed.ChannelBinding);
    }

    [Fact]
    public void Key_value_connection_strings_are_used_as_they_are()
    {
        const string connectionString = "Host=localhost;Database=refract;Username=postgres";

        Assert.Equal(connectionString, PostgresConnectionString.Normalize(connectionString));
    }
}
