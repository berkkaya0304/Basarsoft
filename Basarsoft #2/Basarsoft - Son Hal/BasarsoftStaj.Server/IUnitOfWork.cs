namespace BasarsoftStaj.Server;

public interface IUnitOfWork : IDisposable
{
    IPointService PointService { get; }
    int SaveChanges();
}