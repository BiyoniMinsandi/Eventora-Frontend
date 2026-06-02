namespace Eventora.Infrastructure.Configuration;

public sealed class MongoOptions
{
    public const string SectionName = "Mongo";

    public string ConnectionString { get; init; } = "";
    public string Database { get; init; } = "";
}
