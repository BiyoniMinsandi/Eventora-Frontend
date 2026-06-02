using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Eventora.Application.Contracts.Auth;
using Eventora.Domain.Users;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Eventora.Api.Auth;

/// <summary>
/// Creates signed JWTs for authenticated users.
/// </summary>
public sealed class JwtTokenService
{
    private readonly JwtOptions _options;

    public JwtTokenService(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    public string CreateToken(User user)
    {
        // 24h expiry to match frontend expectations
        var now = DateTimeOffset.UtcNow;
        var expires = now.AddHours(24);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, UserRoleParsing.ToApiString(user.Role)),
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SigningKey));
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            notBefore: now.UtcDateTime,
            expires: expires.UtcDateTime,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
