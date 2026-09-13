using System.Net.Mail;

namespace Refract.Api.Common;

/// <summary>Collects field errors in the shape <see cref="Results.ValidationProblem"/> expects.</summary>
public sealed class Validator
{
    private readonly Dictionary<string, List<string>> _errors = [];

    public bool IsValid => _errors.Count == 0;

    public Validator Required(string field, string? value, int maxLength = 256)
    {
        if (string.IsNullOrWhiteSpace(value)) Add(field, "This field is required.");
        else if (value.Trim().Length > maxLength) Add(field, $"Use at most {maxLength} characters.");
        return this;
    }

    public Validator Email(string field, string? value)
    {
        var email = value?.Trim();
        if (string.IsNullOrEmpty(email))
        {
            Add(field, "This field is required.");
        }
        else if (email.Length > 256 || !MailAddress.TryCreate(email, out var address) || address.Address != email)
        {
            Add(field, "Enter a valid email address.");
        }
        return this;
    }

    public Validator Must(bool condition, string field, string message)
    {
        if (!condition) Add(field, message);
        return this;
    }

    public void Add(string field, string message)
    {
        if (!_errors.TryGetValue(field, out var messages))
        {
            messages = [];
            _errors[field] = messages;
        }
        messages.Add(message);
    }

    public IResult ToProblem() =>
        Results.ValidationProblem(_errors.ToDictionary(error => error.Key, error => error.Value.ToArray()));
}
