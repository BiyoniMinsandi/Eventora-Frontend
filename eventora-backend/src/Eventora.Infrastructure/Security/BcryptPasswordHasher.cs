using Eventora.Application.Abstractions.Security;

namespace Eventora.Infrastructure.Security;

/// <summary>
/// BCrypt-based password hashing implementation.
/// </summary>
public sealed class BcryptPasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            throw new ArgumentException("Password is required", nameof(password));
        }

        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool Verify(string password, string hash)
    {
        if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(hash))
        {
            return false;
        }

        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
}
