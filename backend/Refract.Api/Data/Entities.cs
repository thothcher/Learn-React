using Microsoft.AspNetCore.Identity;

namespace Refract.Api.Data;

/// <summary>An account. Identity adds email, password hash, lockout and security stamp columns.</summary>
public class AppUser : IdentityUser<Guid>
{
    public string DisplayName { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastActiveAt { get; set; }
}

public class LessonCompletion
{
    public Guid UserId { get; set; }
    public string LessonSlug { get; set; } = "";
    public DateTime CompletedAt { get; set; }
}

public class ProjectCompletion
{
    public Guid UserId { get; set; }
    public int Week { get; set; }
    public DateTime CompletedAt { get; set; }
}

/// <summary>The best result a user reached in one game, for example "quiz:week-1" or "memory:hooks".</summary>
public class GameScore
{
    public Guid UserId { get; set; }
    public string GameKey { get; set; } = "";
    public int BestScore { get; set; }
    public DateTime UpdatedAt { get; set; }
}
