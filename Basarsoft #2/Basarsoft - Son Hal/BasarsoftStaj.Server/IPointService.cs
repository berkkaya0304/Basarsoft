public interface IPointService
{
    List<Point> GetAll();
    Point GetById(long id);
    Point Add(Point point);
    Point Update(long id, Point point);
    Point Delete(long id);
}