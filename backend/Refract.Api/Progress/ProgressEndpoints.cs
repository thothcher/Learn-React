using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Refract.Api.Common;
using Refract.Api.Data;

namespace Refract.Api.Progress;

public static class ProgressEndpoints
{
    public static void MapProgressEndpoints(this RouteGroupBuilder api)
    {
        var progress = api.MapGroup("/progress").WithTags("Progress").RequireAuthorization();

        progress.MapGet("/", GetProgress);
        progress.MapDelete("/", ResetProgress);
        progress.MapPut("/lessons/{slug}", CompleteLesson);
        progress.MapDelete("/lessons/{slug}", UndoLesson);
        progress.MapPut("/projects/{week:int}", CompleteProject);
        progress.MapDelete("/projects/{week:int}", UndoProject);
        progress.MapPost("/scores", RecordScore);
        progress.MapPost("/import", ImportProgress);
    }

    private static Task<ProgressResponse> GetProgress(ClaimsPrincipal user, AppDbContext db, CancellationToken cancellationToken) =>
        ProgressQueries.LoadAsync(db, user.GetUserId(), cancellationToken);

    private static async Task<IResult> CompleteLesson(string slug, ClaimsPrincipal user, AppDbContext db, CancellationToken cancellationToken)
    {
        if (!ProgressRules.IsValidSlug(slug)) return InvalidField("slug", "This is not a valid lesson id.");

        var userId = user.GetUserId();
        await RetryOnConflictAsync(db, async () =>
        {
            var exists = await db.LessonCompletions.AnyAsync(lesson => lesson.UserId == userId && lesson.LessonSlug == slug, cancellationToken);
            if (!exists)
            {
                db.LessonCompletions.Add(new LessonCompletion { UserId = userId, LessonSlug = slug, CompletedAt = DateTime.UtcNow });
                await db.SaveChangesAsync(cancellationToken);
            }
            return true;
        });

        await ProgressQueries.TouchAsync(db, userId, cancellationToken);
        return Results.NoContent();
    }

    private static async Task<IResult> UndoLesson(string slug, ClaimsPrincipal user, AppDbContext db, CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();
        await db.LessonCompletions
            .Where(lesson => lesson.UserId == userId && lesson.LessonSlug == slug)
            .ExecuteDeleteAsync(cancellationToken);
        return Results.NoContent();
    }

    private static async Task<IResult> CompleteProject(int week, ClaimsPrincipal user, AppDbContext db, CancellationToken cancellationToken)
    {
        if (!ProgressRules.IsValidWeek(week)) return InvalidField("week", $"Weeks go from 1 to {ProgressRules.Weeks}.");

        var userId = user.GetUserId();
        await RetryOnConflictAsync(db, async () =>
        {
            var exists = await db.ProjectCompletions.AnyAsync(project => project.UserId == userId && project.Week == week, cancellationToken);
            if (!exists)
            {
                db.ProjectCompletions.Add(new ProjectCompletion { UserId = userId, Week = week, CompletedAt = DateTime.UtcNow });
                await db.SaveChangesAsync(cancellationToken);
            }
            return true;
        });

        await ProgressQueries.TouchAsync(db, userId, cancellationToken);
        return Results.NoContent();
    }

    private static async Task<IResult> UndoProject(int week, ClaimsPrincipal user, AppDbContext db, CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();
        await db.ProjectCompletions
            .Where(project => project.UserId == userId && project.Week == week)
            .ExecuteDeleteAsync(cancellationToken);
        return Results.NoContent();
    }

    private static async Task<IResult> RecordScore(ScoreRequest request, ClaimsPrincipal user, AppDbContext db, CancellationToken cancellationToken)
    {
        if (!ProgressRules.IsValidScore(request.Key, request.Score)) return InvalidField("key", "Unknown game or score out of range.");

        var userId = user.GetUserId();
        var key = request.Key!;
        var response = await RetryOnConflictAsync(db, async () =>
        {
            var existing = await db.GameScores.FindAsync([userId, key], cancellationToken);
            var isRecord = existing is null || ProgressRules.IsBetter(key, request.Score, existing.BestScore);

            if (existing is null)
            {
                db.GameScores.Add(new GameScore { UserId = userId, GameKey = key, BestScore = request.Score, UpdatedAt = DateTime.UtcNow });
            }
            else if (isRecord)
            {
                existing.BestScore = request.Score;
                existing.UpdatedAt = DateTime.UtcNow;
            }

            await db.SaveChangesAsync(cancellationToken);
            return new ScoreResponse(existing?.BestScore ?? request.Score, isRecord);
        });

        await ProgressQueries.TouchAsync(db, userId, cancellationToken);
        return Results.Ok(response);
    }

    private static async Task<IResult> ImportProgress(ImportRequest request, ClaimsPrincipal user, AppDbContext db, CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();
        var now = DateTime.UtcNow;

        // Browser data can be stale or edited by hand, so keep valid entries and skip the rest.
        var slugs = (request.Lessons ?? []).Where(ProgressRules.IsValidSlug).Distinct().Take(200).ToList();
        var weeks = (request.Projects ?? []).Where(ProgressRules.IsValidWeek).Distinct().ToList();
        var scores = (request.Scores ?? new Dictionary<string, int>())
            .Where(score => ProgressRules.IsValidScore(score.Key, score.Value))
            .Take(200)
            .ToList();

        await RetryOnConflictAsync(db, async () =>
        {
            var knownSlugs = await db.LessonCompletions.Where(l => l.UserId == userId).Select(l => l.LessonSlug).ToListAsync(cancellationToken);
            db.LessonCompletions.AddRange(slugs.Except(knownSlugs)
                .Select(slug => new LessonCompletion { UserId = userId, LessonSlug = slug, CompletedAt = now }));

            var knownWeeks = await db.ProjectCompletions.Where(p => p.UserId == userId).Select(p => p.Week).ToListAsync(cancellationToken);
            db.ProjectCompletions.AddRange(weeks.Except(knownWeeks)
                .Select(week => new ProjectCompletion { UserId = userId, Week = week, CompletedAt = now }));

            var knownScores = await db.GameScores.Where(s => s.UserId == userId).ToDictionaryAsync(s => s.GameKey, cancellationToken);
            foreach (var (key, score) in scores)
            {
                if (!knownScores.TryGetValue(key, out var existing))
                {
                    db.GameScores.Add(new GameScore { UserId = userId, GameKey = key, BestScore = score, UpdatedAt = now });
                }
                else if (ProgressRules.IsBetter(key, score, existing.BestScore))
                {
                    existing.BestScore = score;
                    existing.UpdatedAt = now;
                }
            }

            await db.SaveChangesAsync(cancellationToken);
            return true;
        });

        await ProgressQueries.TouchAsync(db, userId, cancellationToken);
        return Results.Ok(await ProgressQueries.LoadAsync(db, userId, cancellationToken));
    }

    private static async Task<IResult> ResetProgress(ClaimsPrincipal user, AppDbContext db, CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();
        await db.LessonCompletions.Where(l => l.UserId == userId).ExecuteDeleteAsync(cancellationToken);
        await db.ProjectCompletions.Where(p => p.UserId == userId).ExecuteDeleteAsync(cancellationToken);
        await db.GameScores.Where(s => s.UserId == userId).ExecuteDeleteAsync(cancellationToken);
        return Results.NoContent();
    }

    /// <summary>
    /// Two requests for the same user (for example two open tabs) can insert the same row at once.
    /// The second one hits the primary key, so it forgets its pending changes, re-reads what the
    /// first one saved and tries once more instead of answering 500.
    /// </summary>
    private static async Task<T> RetryOnConflictAsync<T>(AppDbContext db, Func<Task<T>> action)
    {
        try
        {
            return await action();
        }
        catch (DbUpdateException)
        {
            db.ChangeTracker.Clear();
            return await action();
        }
    }

    private static IResult InvalidField(string field, string message) =>
        Results.ValidationProblem(new Dictionary<string, string[]> { [field] = [message] });
}
