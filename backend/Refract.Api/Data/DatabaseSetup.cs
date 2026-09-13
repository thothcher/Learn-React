using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Refract.Api.Data;

public enum DatabaseProvider
{
    Sqlite,
    Postgres,
}

public sealed record DatabaseSettings(DatabaseProvider Provider, string ConnectionString)
{
    /// <summary>
    /// Uses Postgres when DATABASE_URL (added by the Neon integration on Vercel), POSTGRES_URL or
    /// ConnectionStrings:Postgres is set, and a local SQLite file otherwise.
    /// </summary>
    public static DatabaseSettings FromConfiguration(IConfiguration config)
    {
        var postgres = new[] { config["DATABASE_URL"], config["POSTGRES_URL"], config.GetConnectionString("Postgres") }
            .FirstOrDefault(value => !string.IsNullOrWhiteSpace(value));

        return postgres is not null
            ? new(DatabaseProvider.Postgres, PostgresConnectionString.Normalize(postgres))
            : new(DatabaseProvider.Sqlite, config.GetConnectionString("Sqlite") ?? "Data Source=refract.db");
    }
}

public static class PostgresConnectionString
{
    /// <summary>Converts a postgres:// URL, the format hosting providers hand out, into Npgsql's key=value format.</summary>
    public static string Normalize(string value)
    {
        if (!value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
            !value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            return value;
        }

        var uri = new Uri(value);
        var credentials = uri.UserInfo.Split(':', 2);
        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/')),
            Username = Uri.UnescapeDataString(credentials[0]),
            Password = credentials.Length > 1 ? Uri.UnescapeDataString(credentials[1]) : null,
            SslMode = SslMode.Require,
        };

        var query = QueryHelpers.ParseQuery(uri.Query);
        if (query.TryGetValue("sslmode", out var sslMode) &&
            Enum.TryParse<SslMode>(sslMode.ToString().Replace("-", ""), ignoreCase: true, out var mode))
        {
            builder.SslMode = mode;
        }
        if (query.TryGetValue("channel_binding", out var channelBinding) &&
            Enum.TryParse<ChannelBinding>(channelBinding.ToString(), ignoreCase: true, out var binding))
        {
            builder.ChannelBinding = binding;
        }

        return builder.ConnectionString;
    }
}

public static class DatabaseSetup
{
    public static IServiceCollection AddRefractDatabase(this IServiceCollection services)
    {
        services.AddSingleton(provider => DatabaseSettings.FromConfiguration(provider.GetRequiredService<IConfiguration>()));
        services.AddDbContext<AppDbContext>((provider, options) =>
        {
            var database = provider.GetRequiredService<DatabaseSettings>();
            if (database.Provider == DatabaseProvider.Postgres) options.UseNpgsql(database.ConnectionString);
            else options.UseSqlite(database.ConnectionString);
        });
        return services;
    }

    public static async Task InitializeDatabaseAsync(this IServiceProvider services)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var database = scope.ServiceProvider.GetRequiredService<DatabaseSettings>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        if (database.Provider == DatabaseProvider.Sqlite)
        {
            // Local development and tests: build the schema straight from the model.
            // The migrations in Data/Migrations are written for Postgres.
            await db.Database.EnsureCreatedAsync();
        }
        else if (config.GetValue("Database:MigrateOnStartup", true))
        {
            // EF Core locks the database while migrating, so instances starting together apply it once.
            await db.Database.MigrateAsync();
        }
    }
}
