namespace Eventora.Domain.Common;

/// <summary>
/// Base entity with an Id.
/// </summary>
public abstract class EntityBase
{
    public string Id { get; set; } = string.Empty;
}
