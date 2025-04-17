using Microsoft.EntityFrameworkCore;
using Resume_QR_Code_Verification_System.Server.Models;
using System;
using SQLite;
using Microsoft.AspNetCore.Mvc;
using BC = BCrypt.Net.BCrypt;

namespace Resume_QR_Code_Verification_System.Server
{
    public class DbService
    {
        private readonly IGetSet _getSet;
        private readonly IConfiguration _config;
        public static string? UploadPath { get; set; }
        public static string? DBPath { get; set; }

        public DbService(IConfiguration config, IWebHostEnvironment env, IGetSet getSet)
        {
            _getSet = getSet;
            _config = config;
            UploadPath = _config["FileStorage:Path"] ?? Path.Combine(Directory.GetCurrentDirectory(), "app_data");

            DBPath = Path.Combine(
                env.ContentRootPath,
                "app_data",
                "FileStorage.db"
            );

            var directory = Path.GetDirectoryName(DBPath)!;
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            if (!Directory.Exists(UploadPath))
            {
                Directory.CreateDirectory(UploadPath);
            }

            CreateTables();
            SeedTestData();

        }

        public void CreateTables()
        {
            using (SQLiteConnection connection = new(DBPath))
            {
                connection.CreateTable<Upload>();
                connection.CreateTable<User>();
                connection.CreateTable<Company>();
            }
        }

        public void SeedTestData()
        {
            // Seed Companies if empty
            if (!_getSet.GetAll<Company>().Any())
            {
                var company1 = new Company
                {
                    CompanyName = "Tech Innovators Inc.",
                    Description = "Leading technology solutions provider"
                };
                _getSet.Insert(company1);

                var company2 = new Company
                {
                    CompanyName = "Digital Future Ltd.",
                    Description = "Digital transformation specialists"
                };
                _getSet.Insert(company2);
            }

            // Seed Users if empty
            if (!_getSet.GetAll<User>().Any())
            {
                var user1 = new User
                {
                    CompanyId = 1,
                    Username = "john.doe",
                    PasswordHash = BC.HashPassword("test123", BC.GenerateSalt(12))
                };
                _getSet.Insert(user1);

                var user2 = new User
                {
                    CompanyId = 1,
                    Username = "jane.smith",
                    PasswordHash = BC.HashPassword("test123", BC.GenerateSalt(12))
                };
                _getSet.Insert(user2);

                var user3 = new User
                {
                    CompanyId = 2,
                    Username = "mike.jones",
                    PasswordHash = BC.HashPassword("test123", BC.GenerateSalt(12))
                };
                _getSet.Insert(user3);

                var user4 = new User
                {
                    CompanyId = 2,
                    Username = "test",
                    PasswordHash = BC.HashPassword("test", BC.GenerateSalt(12))
                };
                _getSet.Insert(user4);
            }

            // Seed Uploads if empty
            if (!_getSet.GetAll<Upload>().Any())
            {
                // Resume Upload
                var upload1 = new ResumeUpload 
                {
                    CompanyId = 1,
                    FullName = "John Doe",
                    FileName = "john_resume.pdf",
                    StoredFileName = "abc123_resume.pdf",
                    ContentType = "application/pdf",
                    FileSize = 102400,
                    Description = "Senior Developer Position",
                    FilePath = "/uploads/resumes/abc123.pdf",
                    Verified = true,
                    ScannedDate = DateTime.UtcNow.AddDays(-2)
                };
                _getSet.Insert(upload1);

                // DOCX Resume
                var upload2 = new ResumeUpload 
                {
                    CompanyId = 1,
                    FullName = "Jane Smith",
                    FileName = "jane_cv.docx",
                    StoredFileName = "def456_cv.docx",
                    ContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    FileSize = 51200,
                    Description = "Project Manager Application",
                    FilePath = "/uploads/resumes/def456.docx",
                    Verified = false
                };
                _getSet.Insert(upload2);

                // Image Upload (if applicable)
                var upload3 = new ImageUpload 
                {
                    CompanyId = 2,
                    FullName = "Mike Johnson",
                    FileName = "mike_portfolio.pdf",
                    StoredFileName = "ghi789_portfolio.png",
                    ContentType = "application/pdf",
                    FileSize = 204800,
                    Description = "Design Lead Submission",
                    FilePath = "/uploads/portfolios/ghi789.png",
                    Verified = true,
                    ScannedDate = DateTime.UtcNow.AddHours(-12)
                };
                _getSet.Insert(upload3);
            }
        }
    }

    

    public class GetSet : IGetSet
    {
        public bool Insert<TEntity>(TEntity entity) where TEntity : class
        {
            try
            {
                using (var connection = new SQLiteConnection(DbService.DBPath))
                {
                    connection.Insert(entity);
                    return true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error inserting {typeof(TEntity).Name}: {ex.Message}");
                return false;
            }
        }

        public bool Update<TEntity>(TEntity entity) where TEntity : class
        {
            try
            {
                using (var connection = new SQLiteConnection(DbService.DBPath))
                {
                    connection.Update(entity);
                    return true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating {typeof(TEntity).Name}: {ex.Message}");
                return false;
            }
        }

        public bool Delete<TEntity>(int id) where TEntity : class, new()
        {
            try
            {
                using (var connection = new SQLiteConnection(DbService.DBPath))
                {
                    var entity = connection.Find<TEntity>(id);
                    if (entity != null)
                    {
                        connection.Delete(entity);
                        return true;
                    }
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting {typeof(TEntity).Name} with ID {id}: {ex.Message}");
                return false;
            }
        }

        public T GetById<T>(int id) where T : class, new()
        {
            try
            {
                using (var connection = new SQLiteConnection(DbService.DBPath))
                {
                    return connection.Find<T>(id);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving {typeof(T).Name} with ID {id}: {ex.Message}");
                return new T();
            }
        }

        public List<T> GetAll<T>() where T : class, new()
        {
            try
            {
                using (var connection = new SQLiteConnection(DbService.DBPath))
                {
                    return connection.Table<T>().ToList();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving {typeof(T).Name} records: {ex.Message}");
                return new List<T>();
            }
        }

    }
}
