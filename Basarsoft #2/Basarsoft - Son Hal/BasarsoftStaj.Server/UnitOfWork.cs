namespace BasarsoftStaj.Server;

public class UnitOfWork : IUnitOfWork
{
    private readonly PointDbContext _context;
    private IPointService _pointService;

    public UnitOfWork(PointDbContext context)
    {
        _context = context;
    }

    public IPointService PointService
    {
        get
        {
            if (_pointService == null)
            {
                _pointService = new PostgreSqlPointService(_context);
            }
            return _pointService;
        }
    }

    public int SaveChanges()
    {
        return _context.SaveChanges();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}