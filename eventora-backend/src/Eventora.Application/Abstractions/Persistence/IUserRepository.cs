using Eventora.Domain.Users;

namespace Eventora.Application.Abstractions.Persistence;

/// <summary>
/// User persistence operations.
/// </summary>
public interface IUserRepository
{
    Task<IReadOnlyList<User>> GetAllAsync(CancellationToken ct);
    Task<User?> GetByIdAsync(string id, CancellationToken ct);
    Task<User?> GetByEmailAsync(string email, CancellationToken ct);
    Task<IReadOnlyList<User>> FindVendorsAsync(bool approvedOnly, CancellationToken ct);
    Task CreateAsync(User user, CancellationToken ct);
    Task UpdateAsync(User user, CancellationToken ct);
}
