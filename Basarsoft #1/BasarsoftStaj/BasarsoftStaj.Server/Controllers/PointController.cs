using BasarsoftStaj.Server;
using Microsoft.AspNetCore.Mvc;

[Route("[controller]")]
[ApiController]
public class PointController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    public PointController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public Response<List<Point>> GetAll()
    {
        var points = _unitOfWork.PointService.GetAll();
        return new Response<List<Point>>(points, true, "Points retrieved successfully");
    }

    [HttpGet("{id}")]
    public Response<Point> GetById(int id)
    {
        var point = _unitOfWork.PointService.GetById(id);
        if (point == null)
        {
            return new Response<Point>(null, false, "Point not found");
        }
        return new Response<Point>(point, true, "Point retrieved successfully");
    }

    [HttpPost]
    public Response<Point> Add(Point point)
    {
        var addedPoint = _unitOfWork.PointService.Add(point);
        _unitOfWork.SaveChanges();
        return new Response<Point>(addedPoint, true, "Point added successfully");
    }

    [HttpPut("{id}")]
    public Response<Point> Update(int id, Point updatedPoint)
    {
        var point = _unitOfWork.PointService.Update(id, updatedPoint);
        if (point == null)
        {
            return new Response<Point>(null, false, "Point not found");
        }
        _unitOfWork.SaveChanges();
        return new Response<Point>(point, true, "Point updated successfully");
    }

    [HttpDelete("{id}")]
    public Response<Point> Delete(int id)
    {
        var point = _unitOfWork.PointService.Delete(id);
        if (point == null)
        {
            return new Response<Point>(null, false, "Point not found");
        }
        _unitOfWork.SaveChanges();
        return new Response<Point>(point, true, "Point deleted successfully");
    }
}