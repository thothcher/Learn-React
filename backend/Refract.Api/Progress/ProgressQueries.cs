using Microsoft.EntityFrameworkCore;
using Refract.Api.Data;

namespace Refract.Api.Progress;

public static class ProgressQueries
{
    public static async Task<ProgressResponse> LoadAsync(AppDbContext db, Guid userId, CancellationToken cancellationToken = default)
    {
        var lessons = await db.LessonCompletions
            .Where(lesson => lesson.UserId == userId)
            .OrderBy(lesson => lesson.CompletedAt)
            .Select(lesson => new LessonEntry(lesson.LessonSlug, lesson.CompletedAt))
            .ToListAsync(cancellationToken);

        var projects = await db.ProjectCompletions
            .Where(project => project.UserId == userId)
            .OrderBy(project => project.Week)
            .Select(project => new ProjectEntry(project.Week, project.CompletedAt))
            .ToListAsync(cancellationToken);

        var scores = await db.GameScores
            .Where(score => score.UserId == userId)
            .OrderBy(score => score.GameKey)
            .Select(score => new ScoreEntry(score.GameKey, score.BestScore, score.UpdatedAt))
            .ToListAsync(cancellationToken);

        return new ProgressResponse(lessons, projects, scores);
    }

    /// <summary>Records activity for the teacher dashboard's "last active" column.</summary>
    public static Task TouchAsync(AppDbContext db, Guid userId, CancellationToken cancellationToken = default) =>
        db.Users
            .Where(user => user.Id == userId)
            .ExecuteUpdateAsync(set => set.SetProperty(user => user.LastActiveAt, DateTime.UtcNow), cancellationToken);
}
