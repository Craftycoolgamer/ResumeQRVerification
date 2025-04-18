using System.Collections.Generic;

namespace Resume_QR_Code_Verification_System.Server
{
    public interface IGetSet
    {
        bool Insert<TEntity>(TEntity entity) where TEntity : class;
        bool Update<TEntity>(TEntity entity) where TEntity : class;
        bool Delete<TEntity>(int id) where TEntity : class, new();
        T GetById<T>(int id) where T : class, new();
        List<T> GetAll<T>() where T : class, new();
    }
}