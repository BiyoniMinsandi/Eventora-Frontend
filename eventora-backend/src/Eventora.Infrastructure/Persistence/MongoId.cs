using MongoDB.Bson;

namespace Eventora.Infrastructure.Persistence;

internal static class MongoId
{
    public static string NewId() => ObjectId.GenerateNewId().ToString();

    public static void EnsureId<T>(T entity, Func<T, string> get, Action<T, string> set)
    {
        if (entity is null) return;
        if (!string.IsNullOrWhiteSpace(get(entity))) return;
        set(entity, NewId());
    }
}
