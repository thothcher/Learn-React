using Microsoft.EntityFrameworkCore;
using Refract.Api.Auth;
using Refract.Api.Data;
using Refract.Api.Progress;

namespace Refract.Api.Teacher;

public sealed record StudentSummary(
    Guid Id,
    string DisplayName,
    string Email,
    bool EmailConfirmed,
    DateTime CreatedAt,
    DateTime? LastActiveAt,
    int LessonsCompleted,
    int ProjectsCompleted,
    int TestsPassed);

public sealed record StudentDetail(StudentSummary Student, ProgressResponse Progress);

public static class TeacherEndpoints
{
    public static void MapTeacherEndpoints(this RouteGroupBuilder api)
    {
        var teacher = api.MapGroup("/teacher").WithTags("Teacher").RequireAuthorization(Policies.Teacher);

        teacher.MapGet("/students", ListStudents);
        teacher.MapGet("/students/{id:guid}", GetStudent);
    }

    private static Task<List<StudentSummary>> ListStudents(AppDbContext db, CancellationToken cancellationToken) =>
        Students(db).ToListAsync(cancellationToken);

    private static async Task<IResult> GetStudent(Guid id, AppDbContext db, CancellationToken cancellationToken)
    {
        var student = await Students(db, id).FirstOrDefaultAsync(cancellationToken);
        if (student is null) return Results.NotFound();

        var progress = await ProgressQueries.LoadAsync(db, id, cancellationToken);
        return Results.Ok(new StudentDetail(student, progress));
    }

    /// <summary>Accounts without the Teacher role, with progress counts computed by the database.</summary>
    private static IQueryable<StudentSummary> Students(AppDbContext db, Guid? id = null)
    {
        var students = db.Users.Where(user => !db.UserRoles.Any(link =>
            link.UserId == user.Id && db.Roles.Any(role => role.Id == link.RoleId && role.Name == Roles.Teacher)));

        if (id is not null) students = students.Where(user => user.Id == id);

        return students
            .OrderBy(user => user.DisplayName)
            .Select(user => new StudentSummary(
                user.Id,
                user.DisplayName,
                user.Email!,
                user.EmailConfirmed,
                user.CreatedAt,
                user.LastActiveAt,
                db.LessonCompletions.Count(lesson => lesson.UserId == user.Id),
                db.ProjectCompletions.Count(project => project.UserId == user.Id),
                db.GameScores.Count(score => score.UserId == user.Id
                    && score.GameKey.StartsWith("quiz:")
                    && score.BestScore >= ProgressRules.PassMark)));
    }
}
