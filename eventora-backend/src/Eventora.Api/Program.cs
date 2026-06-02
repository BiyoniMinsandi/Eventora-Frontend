var builder = WebApplication.CreateBuilder(args);

// Core services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Infrastructure (MongoDB, persistence, etc.)
builder.Services.AddEventoraInfrastructure(builder.Configuration);

// Health checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Basic endpoints
app.MapGet("/", () => Results.Ok(new { name = "Eventora API", status = "ok" }))
    .WithName("Root");

app.MapHealthChecks("/health");

app.Run();
