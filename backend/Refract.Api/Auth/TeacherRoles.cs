using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Refract.Api.Data;

namespace Refract.Api.Auth;

/// <summary>Keeps the Teacher role in line with the Auth:TeacherEmails setting.</summary>
public sealed class TeacherRoles(
    UserManager<AppUser> users,
    RoleManager<IdentityRole<Guid>> roles,
    IOptions<AuthSettings> settings)
{
    /// <summary>Adds or removes the Teacher role as needed. Returns true when the role changed.</summary>
    public async Task<bool> SyncAsync(AppUser user)
    {
        var shouldBeTeacher = user.EmailConfirmed && settings.Value.IsTeacherEmail(user.Email);
        var isTeacher = await users.IsInRoleAsync(user, Roles.Teacher);
        if (shouldBeTeacher == isTeacher) return false;

        if (shouldBeTeacher)
        {
            if (!await roles.RoleExistsAsync(Roles.Teacher))
            {
                await roles.CreateAsync(new IdentityRole<Guid>(Roles.Teacher));
            }
            await users.AddToRoleAsync(user, Roles.Teacher);
        }
        else
        {
            await users.RemoveFromRoleAsync(user, Roles.Teacher);
        }
        return true;
    }
}
