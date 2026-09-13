namespace Refract.Api.Auth;

// Request fields are nullable because clients can omit them; the endpoints validate them.
public sealed record RegisterRequest(string? DisplayName, string? Email, string? Password);

public sealed record LoginRequest(string? Email, string? Password, bool RememberMe);

public sealed record ConfirmEmailRequest(Guid UserId, string? Code);

public sealed record EmailRequest(string? Email);

public sealed record ResetPasswordRequest(string? Email, string? Code, string? Password);

public sealed record UserResponse(Guid Id, string DisplayName, string Email, bool IsTeacher, DateTime CreatedAt);
