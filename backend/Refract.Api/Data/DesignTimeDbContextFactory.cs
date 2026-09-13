using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Refract.Api.Data;

/// <summary>
/// Used by "dotnet ef". Migrations target Postgres, the production database; set DATABASE_URL
/// to run "dotnet ef database update" against a real server.
/// </summary>
public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? "Host=localhost;Database=refract;Username=postgres;Password=postgres";

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(PostgresConnectionString.Normalize(connectionString))
            .Options;

        return new AppDbContext(options);
    }
}
