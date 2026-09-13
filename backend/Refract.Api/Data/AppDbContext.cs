using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Refract.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>(options), IDataProtectionKeyContext
{
    public DbSet<LessonCompletion> LessonCompletions => Set<LessonCompletion>();
    public DbSet<ProjectCompletion> ProjectCompletions => Set<ProjectCompletion>();
    public DbSet<GameScore> GameScores => Set<GameScore>();

    // ASP.NET Core encrypts auth cookies and email tokens with these keys. Keeping them in the
    // database means sessions survive container restarts and work across several instances.
    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<AppUser>(user => user.Property(u => u.DisplayName).HasMaxLength(80));

        builder.Entity<LessonCompletion>(lesson =>
        {
            lesson.HasKey(l => new { l.UserId, l.LessonSlug });
            lesson.Property(l => l.LessonSlug).HasMaxLength(100);
            lesson.HasOne<AppUser>().WithMany().HasForeignKey(l => l.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ProjectCompletion>(project =>
        {
            project.HasKey(p => new { p.UserId, p.Week });
            project.HasOne<AppUser>().WithMany().HasForeignKey(p => p.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<GameScore>(score =>
        {
            score.HasKey(s => new { s.UserId, s.GameKey });
            score.Property(s => s.GameKey).HasMaxLength(80);
            score.HasOne<AppUser>().WithMany().HasForeignKey(s => s.UserId).OnDelete(DeleteBehavior.Cascade);
        });
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configuration)
    {
        // SQLite does not remember DateTime.Kind. Treat every stored timestamp as UTC,
        // so the JSON the frontend receives always ends with "Z".
        configuration.Properties<DateTime>().HaveConversion<UtcDateTimeConverter>();
    }

    private sealed class UtcDateTimeConverter() : ValueConverter<DateTime, DateTime>(
        value => DateTime.SpecifyKind(value, DateTimeKind.Utc),
        value => DateTime.SpecifyKind(value, DateTimeKind.Utc));
}
