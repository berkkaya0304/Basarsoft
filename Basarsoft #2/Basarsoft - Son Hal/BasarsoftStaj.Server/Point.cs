using System;
using System.Collections.Generic;
using System.Reflection.Emit;
using Microsoft.EntityFrameworkCore;


public class PointDbContext : DbContext
{
    public DbSet<Point> Points { get; set; }

    public PointDbContext(DbContextOptions<PointDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Point>().ToTable("points");
        modelBuilder.Entity<Point>().Property(p => p.Id).HasColumnName("id");
        modelBuilder.Entity<Point>().Property(p => p.WKT).HasColumnName("wkt");
        modelBuilder.Entity<Point>().Property(p => p.name).HasColumnName("name");
    }
}
public class Point
{
    public long Id { get; set; }

    public String WKT { get; set; }
    public String name { get; set; }
}