using Microsoft.EntityFrameworkCore;
using BasarsoftStaj.Server;

var builder2 = WebApplication.CreateBuilder(args);

// Add services to the container.

builder2.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder2.Services.AddEndpointsApiExplorer();
builder2.Services.AddSwaggerGen();

builder2.Services.AddDbContext<PointDbContext>(options =>
    options.UseNpgsql(builder2.Configuration.GetConnectionString("DefaultConnection")));
builder2.Services.AddScoped<IUnitOfWork, UnitOfWork>();

builder2.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        builder =>
        {
            builder.AllowAnyOrigin() // Bu, frontend'inizin çalıştığı URL'dir
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

var app = builder2.Build();
app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
