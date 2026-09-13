namespace Refract.Api.Progress;

public sealed record LessonEntry(string Slug, DateTime CompletedAt);

public sealed record ProjectEntry(int Week, DateTime CompletedAt);

public sealed record ScoreEntry(string Key, int Score, DateTime UpdatedAt);

public sealed record ProgressResponse(
    IReadOnlyList<LessonEntry> Lessons,
    IReadOnlyList<ProjectEntry> Projects,
    IReadOnlyList<ScoreEntry> Scores);

public sealed record ScoreRequest(string? Key, int Score);

public sealed record ScoreResponse(int Best, bool IsRecord);

/// <summary>Progress a visitor saved in the browser before they had an account.</summary>
public sealed record ImportRequest(string[]? Lessons, int[]? Projects, Dictionary<string, int>? Scores);
