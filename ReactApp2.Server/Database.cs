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
        private readonly IConfiguration _config;
        public static string? UploadPath { get; set; }
        public static string? DBPath { get; set; }

        public DbService(IConfiguration config, IWebHostEnvironment env)
        {
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
            CreateTestUser();

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

        private void CreateTestUser()
        {
            try
            {
                using (var connection = new SQLiteConnection(DBPath))
                {
                    // Check if test user exists
                    var testUser = connection.Table<User>()
                        .FirstOrDefault(u => u.Username == "t");

                    if (testUser == null)
                    {
                        var newUser = new User
                        {
                            Username = "t",
                            PasswordHash = BC.HashPassword("t", BC.GenerateSalt(12))
                        };

                        connection.Insert(newUser);
                        Console.WriteLine("Test user created successfully");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating test user: {ex.Message}");
            }
        }

    }



    public class GetSet
    {
        public static bool Insert<TEntity>(TEntity entity) where TEntity : class
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

        public static bool Update<TEntity>(TEntity entity) where TEntity : class
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

        public static bool Delete<TEntity>(int id) where TEntity : class, new()
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

        public static T GetById<T>(int id) where T : class, new()
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
                return null;
            }
        }

        //public static List<Upload> GetAll(Upload _) => GetAll<Upload>();
        //public static List<User> GetAll(User _) => GetAll<User>();
        public static List<T> GetAll<T>() where T : class, new()
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
