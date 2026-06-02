using Eventora.Infrastructure.Configuration;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Eventora.Infrastructure.Mongo;

public interface IMongoDatabaseFactory
{
    IMongoDatabase GetDatabase();
}

internal sealed class MongoDatabaseFactory : IMongoDatabaseFactory
{
    private readonly IMongoClient _client;
    private readonly IOptions<MongoOptions> _options;

    public MongoDatabaseFactory(IMongoClient client, IOptions<MongoOptions> options)
    {
        _client = client;
        _options = options;
    }

    public IMongoDatabase GetDatabase()
    {
        var databaseName = _options.Value.Database;
        if (string.IsNullOrWhiteSpace(databaseName))
        {
            throw new InvalidOperationException("Mongo database name is not configured.");
        }

        return _client.GetDatabase(databaseName);
    }
}
