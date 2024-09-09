public class PostgreSqlPointService : GenericService<Point>, IPointService
{
    public PostgreSqlPointService(PointDbContext context) : base(context)
    {
    }
}
