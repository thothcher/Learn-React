using System.Net;
using System.Net.Http.Json;
using Refract.Api.Progress;

namespace Refract.Api.Tests;

public sealed class ProgressTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task Progress_requires_a_signed_in_user()
    {
        var response = await factory.CreateBrowser().GetAsync("/api/progress");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Lessons_projects_and_scores_round_trip()
    {
        var client = await factory.SignedInClientAsync(TestApi.UniqueEmail());

        Assert.Equal(HttpStatusCode.NoContent, (await client.PutAsync("/api/progress/lessons/props", null)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PutAsync("/api/progress/lessons/props", null)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PutAsync("/api/progress/projects/1", null)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsync("/api/progress/projects/9", null)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsync("/api/progress/lessons/Not_A_Slug", null)).StatusCode);

        Assert.Equal(new ScoreResponse(60, true), await RecordAsync(client, "quiz:week-1", 60));
        Assert.Equal(new ScoreResponse(60, false), await RecordAsync(client, "quiz:week-1", 50));
        Assert.Equal(new ScoreResponse(90, true), await RecordAsync(client, "quiz:week-1", 90));

        // Memory cards count moves, so a lower number is the better score.
        Assert.Equal(new ScoreResponse(20, true), await RecordAsync(client, "memory:hooks", 20));
        Assert.Equal(new ScoreResponse(20, false), await RecordAsync(client, "memory:hooks", 25));
        Assert.Equal(new ScoreResponse(16, true), await RecordAsync(client, "memory:hooks", 16));

        var progress = await client.GetFromJsonAsync<ProgressResponse>("/api/progress");
        Assert.NotNull(progress);
        Assert.Equal(["props"], progress.Lessons.Select(lesson => lesson.Slug));
        Assert.Equal([1], progress.Projects.Select(project => project.Week));
        Assert.Equal(DateTimeKind.Utc, progress.Lessons[0].CompletedAt.Kind);
        Assert.Equal(90, progress.Scores.Single(score => score.Key == "quiz:week-1").Score);
        Assert.Equal(16, progress.Scores.Single(score => score.Key == "memory:hooks").Score);

        Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync("/api/progress/lessons/props")).StatusCode);
        var afterUndo = await client.GetFromJsonAsync<ProgressResponse>("/api/progress");
        Assert.Empty(afterUndo!.Lessons);
    }

    [Fact]
    public async Task Import_merges_browser_progress_and_skips_invalid_entries()
    {
        var client = await factory.SignedInClientAsync(TestApi.UniqueEmail());
        await client.PutAsync("/api/progress/lessons/jsx", null);
        await RecordAsync(client, "quiz:week-1", 90);

        var response = await client.PostAsJsonAsync("/api/progress/import", new
        {
            lessons = new[] { "jsx", "props", "NOT VALID" },
            projects = new[] { 2, 42 },
            scores = new Dictionary<string, int> { ["quiz:week-1"] = 70, ["memory:hooks"] = 18, ["hack"] = 5 },
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var progress = await response.Content.ReadFromJsonAsync<ProgressResponse>();
        Assert.NotNull(progress);
        Assert.Equal(["jsx", "props"], progress.Lessons.Select(lesson => lesson.Slug).Order());
        Assert.Equal([2], progress.Projects.Select(project => project.Week));
        Assert.Equal(90, progress.Scores.Single(score => score.Key == "quiz:week-1").Score);
        Assert.Equal(18, progress.Scores.Single(score => score.Key == "memory:hooks").Score);
        Assert.Equal(2, progress.Scores.Count);
    }

    [Fact]
    public async Task Reset_clears_all_progress()
    {
        var client = await factory.SignedInClientAsync(TestApi.UniqueEmail());
        await client.PutAsync("/api/progress/lessons/jsx", null);
        await client.PutAsync("/api/progress/projects/3", null);
        await RecordAsync(client, "gaps", 9);

        Assert.Equal(HttpStatusCode.NoContent, (await client.DeleteAsync("/api/progress")).StatusCode);

        var progress = await client.GetFromJsonAsync<ProgressResponse>("/api/progress");
        Assert.Empty(progress!.Lessons);
        Assert.Empty(progress.Projects);
        Assert.Empty(progress.Scores);
    }

    private static async Task<ScoreResponse?> RecordAsync(HttpClient client, string key, int score)
    {
        var response = await client.PostAsJsonAsync("/api/progress/scores", new { key, score });
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<ScoreResponse>();
    }
}
