using System.Text.RegularExpressions;

namespace Refract.Api.Progress;

/// <summary>
/// The course content lives in the React app, so the API checks the shape of ids
/// rather than a list of lessons.
/// </summary>
public static partial class ProgressRules
{
    public const int Weeks = 8;

    /// <summary>A test counts as passed from this percentage.</summary>
    public const int PassMark = 80;

    public static bool IsValidSlug(string? slug) => slug is { Length: <= 100 } && SlugPattern().IsMatch(slug);

    public static bool IsValidWeek(int week) => week is >= 1 and <= Weeks;

    public static bool IsValidScore(string? key, int score) =>
        key is not null && GameKeyPattern().IsMatch(key) && score is >= 0 and <= 100_000;

    /// <summary>Memory cards count moves, so fewer is better. The other games count points or percent.</summary>
    public static bool IsBetter(string key, int candidate, int current) =>
        key.StartsWith("memory:", StringComparison.Ordinal) ? candidate < current : candidate > current;

    [GeneratedRegex("^[a-z0-9]+(-[a-z0-9]+)*$")]
    private static partial Regex SlugPattern();

    [GeneratedRegex("^(match|memory|quiz|gaps)(:[a-z0-9-]{1,60})?$")]
    private static partial Regex GameKeyPattern();
}
