using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Refract.Api.Common;
using Refract.Api.Data;

namespace Refract.Api.Auth;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this RouteGroupBuilder api)
    {
        var auth = api.MapGroup("/auth").WithTags("Auth");

        // Called on every page load, so these two are not rate limited.
        auth.MapGet("/me", GetCurrentUser).RequireAuthorization();
        auth.MapPost("/logout", Logout);

        auth.MapPost("/register", Register).RequireRateLimiting(RateLimits.Auth);
        auth.MapPost("/login", Login).RequireRateLimiting(RateLimits.Auth);
        auth.MapPost("/confirm-email", ConfirmEmail).RequireRateLimiting(RateLimits.Auth);
        auth.MapPost("/resend-confirmation", ResendConfirmation).RequireRateLimiting(RateLimits.Auth);
        auth.MapPost("/forgot-password", ForgotPassword).RequireRateLimiting(RateLimits.Auth);
        auth.MapPost("/reset-password", ResetPassword).RequireRateLimiting(RateLimits.Auth);
    }

    private static async Task<IResult> Register(RegisterRequest request, UserManager<AppUser> users, AccountEmails emails)
    {
        var validator = new Validator()
            .Required("displayName", request.DisplayName, maxLength: 80)
            .Email("email", request.Email)
            .Required("password", request.Password, maxLength: 128);
        if (!validator.IsValid) return validator.ToProblem();

        var email = request.Email!.Trim();
        var user = new AppUser { UserName = email, Email = email, DisplayName = request.DisplayName!.Trim() };
        var result = await users.CreateAsync(user, request.Password!);
        if (!result.Succeeded) return IdentityErrors.ToProblem(result);

        await emails.SendConfirmationAsync(user);
        return Results.Created("/api/auth/me", new { user.Id, user.Email });
    }

    private static async Task<IResult> Login(
        LoginRequest request,
        UserManager<AppUser> users,
        SignInManager<AppUser> signIn,
        TeacherRoles teacherRoles)
    {
        var validator = new Validator()
            .Email("email", request.Email)
            .Required("password", request.Password, maxLength: 128);
        if (!validator.IsValid) return validator.ToProblem();

        var user = await users.FindByEmailAsync(request.Email!.Trim());
        if (user is null)
        {
            // Hash anyway, so an unknown email takes about as long to reject as a wrong password.
            users.PasswordHasher.HashPassword(new AppUser(), request.Password!);
            return InvalidCredentials();
        }
        if (await users.IsLockedOutAsync(user)) return LockedOut();

        if (!user.EmailConfirmed)
        {
            // Only someone who knows the password learns that the email is still unconfirmed.
            if (await users.CheckPasswordAsync(user, request.Password!))
            {
                return Problem(StatusCodes.Status403Forbidden, "EmailNotConfirmed", "Confirm your email first",
                    "Open the link we emailed you, or request a new one.");
            }
            await users.AccessFailedAsync(user);
            return InvalidCredentials();
        }

        var result = await signIn.CheckPasswordSignInAsync(user, request.Password!, lockoutOnFailure: true);
        if (result.IsLockedOut) return LockedOut();
        if (!result.Succeeded) return InvalidCredentials();

        await teacherRoles.SyncAsync(user);
        user.LastActiveAt = DateTime.UtcNow;
        await users.UpdateAsync(user);
        await signIn.SignInAsync(user, isPersistent: request.RememberMe);

        return Results.Ok(await ToResponseAsync(user, users));
    }

    private static async Task<IResult> GetCurrentUser(
        ClaimsPrincipal principal,
        UserManager<AppUser> users,
        SignInManager<AppUser> signIn,
        TeacherRoles teacherRoles)
    {
        var user = await users.GetUserAsync(principal);
        if (user is null) return Results.Unauthorized();

        // Auth:TeacherEmails can change while sessions stay open, so re-check it on every page load
        // and reissue the cookie when the role changed, instead of waiting for the next login.
        if (await teacherRoles.SyncAsync(user)) await signIn.RefreshSignInAsync(user);

        return Results.Ok(await ToResponseAsync(user, users));
    }

    private static async Task<IResult> Logout(SignInManager<AppUser> signIn)
    {
        await signIn.SignOutAsync();
        return Results.NoContent();
    }

    private static async Task<IResult> ConfirmEmail(ConfirmEmailRequest request, UserManager<AppUser> users)
    {
        var token = AccountEmails.DecodeToken(request.Code);
        var user = await users.FindByIdAsync(request.UserId.ToString());
        if (user is null || token is null) return InvalidLink();
        if (user.EmailConfirmed) return Results.NoContent();

        var result = await users.ConfirmEmailAsync(user, token);
        if (result.Succeeded) return Results.NoContent();

        // Two requests with the same link (a double click, or React Strict Mode in development) can
        // confirm at the same moment. The slower one fails with a concurrency error although the
        // email is now confirmed, so check the database before reporting a bad link.
        var confirmedMeanwhile = await users.Users.AsNoTracking()
            .AnyAsync(candidate => candidate.Id == user.Id && candidate.EmailConfirmed);
        return confirmedMeanwhile ? Results.NoContent() : InvalidLink();
    }

    private static async Task<IResult> ResendConfirmation(EmailRequest request, UserManager<AppUser> users, AccountEmails emails)
    {
        var validator = new Validator().Email("email", request.Email);
        if (!validator.IsValid) return validator.ToProblem();

        var user = await users.FindByEmailAsync(request.Email!.Trim());
        if (user is { EmailConfirmed: false }) await emails.SendConfirmationAsync(user);

        // The same answer whether or not the account exists, so emails can't be discovered this way.
        return Results.Accepted();
    }

    private static async Task<IResult> ForgotPassword(EmailRequest request, UserManager<AppUser> users, AccountEmails emails)
    {
        var validator = new Validator().Email("email", request.Email);
        if (!validator.IsValid) return validator.ToProblem();

        var user = await users.FindByEmailAsync(request.Email!.Trim());
        if (user is { EmailConfirmed: true }) await emails.SendPasswordResetAsync(user);

        return Results.Accepted();
    }

    private static async Task<IResult> ResetPassword(ResetPasswordRequest request, UserManager<AppUser> users)
    {
        var validator = new Validator()
            .Email("email", request.Email)
            .Required("code", request.Code, maxLength: 4096)
            .Required("password", request.Password, maxLength: 128);
        if (!validator.IsValid) return validator.ToProblem();

        var user = await users.FindByEmailAsync(request.Email!.Trim());
        var token = AccountEmails.DecodeToken(request.Code);
        if (user is null || token is null) return InvalidLink();

        var result = await users.ResetPasswordAsync(user, token, request.Password!);
        if (!result.Succeeded)
        {
            return result.Errors.Any(error => error.Code == nameof(IdentityErrorDescriber.InvalidToken))
                ? InvalidLink()
                : IdentityErrors.ToProblem(result);
        }

        // Proving access to the inbox also lifts a lockout from earlier failed logins.
        await users.SetLockoutEndDateAsync(user, null);
        await users.ResetAccessFailedCountAsync(user);
        return Results.NoContent();
    }

    private static async Task<UserResponse> ToResponseAsync(AppUser user, UserManager<AppUser> users) =>
        new(user.Id, user.DisplayName, user.Email!, await users.IsInRoleAsync(user, Roles.Teacher), user.CreatedAt);

    private static IResult InvalidCredentials() =>
        Problem(StatusCodes.Status401Unauthorized, "InvalidCredentials", "Wrong email or password", "Check your details and try again.");

    private static IResult LockedOut() =>
        Problem(StatusCodes.Status423Locked, "LockedOut", "Too many attempts",
            "This account is locked for 15 minutes after repeated failed logins. You can also reset your password.");

    private static IResult InvalidLink() =>
        Problem(StatusCodes.Status400BadRequest, "InvalidLink", "This link is invalid or has expired",
            "Request a new email and use the most recent link.");

    private static IResult Problem(int status, string code, string title, string detail) =>
        Results.Problem(detail: detail, statusCode: status, title: title,
            extensions: new Dictionary<string, object?> { ["code"] = code });
}
