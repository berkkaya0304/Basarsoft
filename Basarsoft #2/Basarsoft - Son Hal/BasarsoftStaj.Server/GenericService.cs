using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public interface IGenericService<T> where T : class
{
    List<T> GetAll();
    T GetById(long id);
    T Add(T entity);
    T Update(long id, T updatedEntity);
    T Delete(long id);
}

public class GenericService<T> : IGenericService<T> where T : class
{
    private readonly DbContext _context;
    private readonly DbSet<T> _dbSet;

    public GenericService(DbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public List<T> GetAll()
    {
        return _dbSet.ToList();
    }

    public T GetById(long id)
    {
        return _dbSet.Find(id);
    }

    public T Add(T entity)
    {
        _dbSet.Add(entity);
        _context.SaveChanges();
        return entity;
    }

    public T Update(long id, T updatedEntity)
    {
        var entity = _dbSet.Find(id);
        if (entity != null)
        {
            _context.Entry(entity).CurrentValues.SetValues(updatedEntity);
            _context.SaveChanges();
        }
        return entity;
    }

    public T Delete(long id)
    {
        var entity = _dbSet.Find(id);
        if (entity != null)
        {
            _dbSet.Remove(entity);
            _context.SaveChanges();
        }
        return entity;
    }
}
