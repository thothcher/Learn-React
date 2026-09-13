using System.Security.Claims;

namespace Refract.Api.Common;

public static class ClaimsExtensions
{
    /// <summary>Reads the signed-in user's id from the authentication cookie.</summary>
    public static Guid GetUserId(this ClaimsPrincipal user) =>
        Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("The request has no signed-in user."));
}
