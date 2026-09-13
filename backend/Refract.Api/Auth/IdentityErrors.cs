using Microsoft.AspNetCore.Identity;

namespace Refract.Api.Auth;

/// <summary>Turns Identity errors into a validation problem keyed by form field.</summary>
internal static class IdentityErrors
{
    public static IResult ToProblem(IdentityResult result) =>
        Results.ValidationProblem(result.Errors
            .GroupBy(error => FieldFor(error.Code))
            .ToDictionary(group => group.Key, group => group.Select(Describe).Distinct().ToArray()));

    private static string FieldFor(string code) => code switch
    {
        nameof(IdentityErrorDescriber.DuplicateEmail) or nameof(IdentityErrorDescriber.DuplicateUserName) or
        nameof(IdentityErrorDescriber.InvalidEmail) or nameof(IdentityErrorDescriber.InvalidUserName) => "email",
        _ when code.StartsWith("Password", StringComparison.Ordinal) => "password",
        _ => "form",
    };

    private static string Describe(IdentityError error) => error.Code switch
    {
        nameof(IdentityErrorDescriber.DuplicateEmail) or nameof(IdentityErrorDescriber.DuplicateUserName) =>
            "An account with this email already exists.",
        _ => error.Description,
    };
}
