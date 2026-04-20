using System.ComponentModel.DataAnnotations;

namespace Eventora.Application.Contracts.Users;

public sealed record ChangePasswordRequest(
    [property: Required] string CurrentPassword,
    [property: Required, MinLength(6)] string NewPassword);
