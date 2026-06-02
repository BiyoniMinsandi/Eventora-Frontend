using Eventora.Api.Endpoints;
using Eventora.Api.Hubs;
using Eventora.Api.Seed;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddOptions<Eventora.Api.Auth.JwtOptions>()
    .Bind(builder.Configuration.GetSection(Eventora.Api.Auth.JwtOptions.SectionName))
    .Validate(o => !string.IsNullOrWhiteSpace(o.SigningKey) && o.SigningKey.Length >= 32, "Jwt:SigningKey must be at least 32 chars")
    .ValidateOnStart();

// Core services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

// Infrastructure (MongoDB, persistence, etc.)
builder.Services.AddEventoraInfrastructure(builder.Configuration);

// AuthN/AuthZ
builder.Services.AddSingleton<Eventora.Api.Auth.JwtTokenService>();
builder.Services
    .AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        var jwt = builder.Configuration.GetSection(Eventora.Api.Auth.JwtOptions.SectionName).Get<Eventora.Api.Auth.JwtOptions>()
                  ?? new Eventora.Api.Auth.JwtOptions();

        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt.Issuer,
            ValidateAudience = true,
            ValidAudience = jwt.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwt.SigningKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(2),
        };

        // SignalR WebSocket connections send the token as a query param because browsers
        // cannot set Authorization headers on WebSocket upgrade requests.
        options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                var token = ctx.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(token) && ctx.Request.Path.StartsWithSegments("/hubs"))
                {
                    ctx.Token = token;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", p => p.RequireRole("admin"));
    options.AddPolicy("VendorOnly", p => p.RequireRole("vendor"));
    options.AddPolicy("CustomerOnly", p => p.RequireRole("customer"));
});

// MongoDB seed data (development convenience)
builder.Services
    .AddOptions<MongoSeedOptions>()
    .Bind(builder.Configuration.GetSection(MongoSeedOptions.SectionName));

builder.Services.AddHostedService<MongoSeedHostedService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", p =>
        p.WithOrigins(
                "http://localhost:3000",
                "http://localhost:3001")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

// Health checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("FrontendDev");

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

// Basic endpoints
app.MapGet("/", () => Results.Ok(new { name = "Eventora API", status = "ok" }))
    .WithName("Root");

app.MapHealthChecks("/health");

// --- Auth endpoints (matches frontend: /api/auth/register + /api/auth/login)
var authGroup = app.MapGroup("/api/auth").WithTags("Auth");

authGroup.MapPost("/register", async (
        Eventora.Application.Contracts.Auth.RegisterRequest req,
        Eventora.Application.Abstractions.Persistence.IUserRepository users,
        Eventora.Application.Abstractions.Security.IPasswordHasher hasher,
        Eventora.Api.Auth.JwtTokenService tokens,
        CancellationToken ct) =>
    {
        if (!Eventora.Application.Contracts.Auth.UserRoleParsing.TryParse(req.Role, out var role))
        {
            return Results.BadRequest(new { message = "Invalid role" });
        }

        // Business rule: only customers/vendors can self-register.
        if (role == Eventora.Domain.Users.UserRole.Admin)
        {
            return Results.BadRequest(new { message = "Admin registration is not allowed" });
        }

        var existing = await users.GetByEmailAsync(req.Email, ct);
        if (existing is not null)
        {
            return Results.Conflict(new { message = "Email already registered" });
        }

        var user = new Eventora.Domain.Users.User
        {
            Email = req.Email.Trim().ToLowerInvariant(),
            FullName = req.FullName.Trim(),
            Role = role,
            PasswordHash = hasher.Hash(req.Password),
            Phone = string.IsNullOrWhiteSpace(req.Phone) ? null : req.Phone.Trim(),
            BusinessName = string.IsNullOrWhiteSpace(req.BusinessName) ? null : req.BusinessName.Trim(),
            Category = string.IsNullOrWhiteSpace(req.Category) ? null : req.Category.Trim(),
            Location = string.IsNullOrWhiteSpace(req.Location) ? null : req.Location.Trim(),
            Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim(),
            Services = req.Services ?? [],
            Pricing = string.IsNullOrWhiteSpace(req.Pricing) ? null : req.Pricing.Trim(),
            Experience = string.IsNullOrWhiteSpace(req.Experience) ? null : req.Experience.Trim(),
            Approved = role != Eventora.Domain.Users.UserRole.Vendor,
            ApprovedAt = role != Eventora.Domain.Users.UserRole.Vendor ? DateTimeOffset.UtcNow : null,
        };

        await users.CreateAsync(user, ct);

        // Vendors can register but cannot log in until approved.
        if (user.Role == Eventora.Domain.Users.UserRole.Vendor && !user.Approved)
        {
            return Results.Ok(new
            {
                token = string.Empty,
                user = new { id = user.Id, email = user.Email, fullName = user.FullName, role = "vendor", approved = user.Approved, createdAt = user.CreatedAt.ToString("O") },
                message = "Vendor registration submitted. Pending admin approval."
            });
        }

        var token = tokens.CreateToken(user);
        return Results.Ok(new Eventora.Application.Contracts.Auth.AuthResponse(
            token,
            new Eventora.Application.Contracts.Auth.AuthUserDto(
                user.Id,
                user.Email,
                user.FullName,
                Eventora.Application.Contracts.Auth.UserRoleParsing.ToApiString(user.Role),
                user.Role == Eventora.Domain.Users.UserRole.Vendor ? user.Approved : null,
                user.CreatedAt.ToString("O"))
        ));
    })
    .WithName("Register");

authGroup.MapPost("/login", async (
        Eventora.Application.Contracts.Auth.LoginRequest req,
        Eventora.Application.Abstractions.Persistence.IUserRepository users,
        Eventora.Application.Abstractions.Security.IPasswordHasher hasher,
        Eventora.Api.Auth.JwtTokenService tokens,
        CancellationToken ct) =>
    {
        var user = await users.GetByEmailAsync(req.Email, ct);
        if (user is null)
        {
            return Results.Json(new { message = "Invalid email or password" }, statusCode: StatusCodes.Status401Unauthorized);
        }

        // Block suspended/rejected accounts.
        if (user.RejectedAt is not null)
        {
            var reason = string.IsNullOrWhiteSpace(user.RejectionReason) ? "Account is suspended" : user.RejectionReason;
            return Results.Json(new { message = reason }, statusCode: StatusCodes.Status401Unauthorized);
        }

        if (!hasher.Verify(req.Password, user.PasswordHash))
        {
            return Results.Json(new { message = "Invalid email or password" }, statusCode: StatusCodes.Status401Unauthorized);
        }

        // Business rule: vendors require admin approval.
        if (user.Role == Eventora.Domain.Users.UserRole.Vendor && !user.Approved)
        {
            return Results.Json(new { message = "Your vendor account is pending admin approval" }, statusCode: StatusCodes.Status401Unauthorized);
        }

        var token = tokens.CreateToken(user);
        return Results.Ok(new Eventora.Application.Contracts.Auth.AuthResponse(
            token,
            new Eventora.Application.Contracts.Auth.AuthUserDto(
                user.Id,
                user.Email,
                user.FullName,
                Eventora.Application.Contracts.Auth.UserRoleParsing.ToApiString(user.Role),
                user.Role == Eventora.Domain.Users.UserRole.Vendor ? user.Approved : null,
                user.CreatedAt.ToString("O"))
        ));
    })
    .WithName("Login");

// --- SignalR hub
app.MapHub<ChatHub>("/hubs/chat");

// --- Feature endpoints
app.MapUserEndpoints();
app.MapVendorEndpoints();
app.MapBookingEndpoints();
app.MapMessagingEndpoints();
app.MapReviewsEndpoints();
app.MapDisputesEndpoints();
app.MapNotificationsEndpoints();

app.Run();
