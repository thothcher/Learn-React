using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Refract.Api.Common;
using Refract.Api.Data;
using Refract.Api.Email;

namespace Refract.Api.Auth;

/// <summary>Creates Identity tokens and emails them as links to pages in the React app.</summary>
public sealed class AccountEmails(
    UserManager<AppUser> users,
    IEmailService email,
    IOptions<AppSettings> app,
    IMemoryCache recentlySent,
    ILogger<AccountEmails> logger)
{
    public async Task<bool> SendConfirmationAsync(AppUser user)
    {
        if (!StartCooldown(user, "confirm")) return false;
        var token = await users.GenerateEmailConfirmationTokenAsync(user);
        var link = Link("/confirm-email", new() { ["userId"] = user.Id.ToString(), ["code"] = EncodeToken(token) });
        return await TrySendAsync(EmailTemplates.ConfirmEmail(user.Email!, user.DisplayName, link));
    }

    public async Task<bool> SendPasswordResetAsync(AppUser user)
    {
        if (!StartCooldown(user, "reset")) return false;
        var token = await users.GeneratePasswordResetTokenAsync(user);
        var link = Link("/reset-password", new() { ["email"] = user.Email, ["code"] = EncodeToken(token) });
        return await TrySendAsync(EmailTemplates.ResetPassword(user.Email!, user.DisplayName, link));
    }

    // Identity tokens contain characters like "+" and "/", so they travel base64url-encoded in links.
    public static string EncodeToken(string token) => WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

    public static string? DecodeToken(string? code)
    {
        if (string.IsNullOrWhiteSpace(code)) return null;
        try
        {
            return Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code));
        }
        catch (FormatException)
        {
            return null;
        }
    }

    /// <summary>
    /// Allows one email of each kind per account per minute, so repeated requests can't flood an inbox.
    /// The memory is per server instance, which is enough to stop casual abuse.
    /// </summary>
    private bool StartCooldown(AppUser user, string kind)
    {
        var key = $"account-email:{kind}:{user.Id}";
        if (recentlySent.TryGetValue(key, out _)) return false;
        recentlySent.Set(key, true, TimeSpan.FromMinutes(1));
        return true;
    }

    private string Link(string path, Dictionary<string, string?> query) =>
        QueryHelpers.AddQueryString(app.Value.PublicUrl + path, query);

    private async Task<bool> TrySendAsync(EmailMessage message)
    {
        try
        {
            await email.SendAsync(message);
            return true;
        }
        catch (Exception exception)
        {
            // The account change already happened; the user can request the email again.
            logger.LogError(exception, "Could not send the \"{Subject}\" email", message.Subject);
            return false;
        }
    }
}
