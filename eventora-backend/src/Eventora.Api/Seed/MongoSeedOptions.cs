namespace Eventora.Api.Seed;

public sealed class MongoSeedOptions
{
    public const string SectionName = "Seed";

    public bool Enabled { get; init; } = false;

    public string AdminEmail { get; init; } = "admin@example.com";
    public string AdminPassword { get; init; } = "Demo123";

    public string DemoCustomerEmail { get; init; } = "customer@example.com";
    public string DemoVendorEmail { get; init; } = "vendor@example.com";
    public string DemoPassword { get; init; } = "Demo123";
}
