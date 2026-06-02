using Eventora.Application.Abstractions.Persistence;
using Eventora.Domain.Users;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Eventora.Infrastructure.Persistence;

/// <summary>
/// MongoDB implementation for user persistence.
/// </summary>
internal sealed class MongoUserRepository(MongoCollections collections) : IUserRepository
{
    private readonly IMongoCollection<User> _users = collections.Users;

    public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken ct)
    {
        return await _users.Find(Builders<User>.Filter.Empty)
            .SortByDescending(u => u.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<User?> GetByIdAsync(string id, CancellationToken ct)
    {
        return await _users.Find(u => u.Id == id).FirstOrDefaultAsync(ct);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct)
    {
        var normalized = (email ?? string.Empty).Trim().ToLowerInvariant();
        return await _users.Find(u => u.Email == normalized).FirstOrDefaultAsync(ct);
    }

    public async Task<IReadOnlyList<User>> FindVendorsAsync(bool approvedOnly, CancellationToken ct)
    {
        var filter = Builders<User>.Filter.Eq(u => u.Role, UserRole.Vendor);
        if (approvedOnly)
        {
            filter &= Builders<User>.Filter.Eq(u => u.Approved, true);
        }

        return await _users.Find(filter).SortByDescending(u => u.CreatedAt).ToListAsync(ct);
    }

    public async Task CreateAsync(User user, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(user.Id))
        {
            user.Id = ObjectId.GenerateNewId().ToString();
        }

        user.Email = user.Email.Trim().ToLowerInvariant();
        user.CreatedAt = DateTimeOffset.UtcNow;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _users.InsertOneAsync(user, cancellationToken: ct);
    }

    public async Task UpdateAsync(User user, CancellationToken ct)
    {
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _users.ReplaceOneAsync(u => u.Id == user.Id, user, cancellationToken: ct);
    }
}
