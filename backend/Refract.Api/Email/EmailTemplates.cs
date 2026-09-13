using System.Text.Encodings.Web;

namespace Refract.Api.Email;

public static class EmailTemplates
{
    public static EmailMessage ConfirmEmail(string to, string name, string link) => Build(
        to,
        subject: "Confirm your Refract account",
        name,
        intro: "Thanks for signing up. Confirm your email address to start saving your progress.",
        action: "Confirm email",
        link,
        footer: "The link expires in 3 hours. If you did not create an account, you can ignore this email.");

    public static EmailMessage ResetPassword(string to, string name, string link) => Build(
        to,
        subject: "Reset your Refract password",
        name,
        intro: "We received a request to reset your password. Choose a new one with the button below.",
        action: "Reset password",
        link,
        footer: "The link expires in 3 hours. If you did not ask for this, your password stays the same.");

    private static EmailMessage Build(string to, string subject, string name, string intro, string action, string link, string footer)
    {
        var encode = HtmlEncoder.Default;
        var html = $"""
            <div style="background:#f6f7f9;padding:32px 16px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#23272f">
              <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px">
                <p style="margin:0 0 24px;font-size:18px;font-weight:600">Refract</p>
                <p style="margin:0 0 12px;font-size:16px">Hi {encode.Encode(name)},</p>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#56607a">{encode.Encode(intro)}</p>
                <a href="{encode.Encode(link)}" style="display:inline-block;background:#087ea4;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px">{encode.Encode(action)}</a>
                <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#8790a3">{encode.Encode(footer)}</p>
              </div>
            </div>
            """;
        var text = $"Hi {name},\n\n{intro}\n\n{action}: {link}\n\n{footer}";

        return new EmailMessage(to, subject, html, text);
    }
}
