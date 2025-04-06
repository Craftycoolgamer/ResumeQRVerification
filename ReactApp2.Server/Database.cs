using Microsoft.EntityFrameworkCore;
using Resume_QR_Code_Verification_System.Server.Controllers;
using Resume_QR_Code_Verification_System.Server.Models;
using System;
using SQLite;
using Microsoft.AspNetCore.Mvc;

namespace Resume_QR_Code_Verification_System.Server
{
    //public class AppDbContext : DbContext
    //{
    //    //dbSet<products>
    //    //dbSet<users>

    //    //TODO: switch over to sqlite

    //    public DbSet<Upload> FileRecords { get; set; }

    //    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        

    //    protected override void OnModelCreating(ModelBuilder modelBuilder)
    //    {
    //        modelBuilder.Entity<Upload>().ToTable("FileRecords");
    //    }


    //}

    

    public class DbService
    {
        private readonly IConfiguration _config;
        public static string? UploadPath { get; set; }
        public static string? DBPath { get; set; }

        public DbService(IConfiguration config, IWebHostEnvironment env)
        {
            _config = config;
            UploadPath = _config["FileStorage:Path"] ?? Path.Combine(Directory.GetCurrentDirectory(), "Uploads");

            DBPath = Path.Combine(
                env.ContentRootPath,
                "App_Data",
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
        


        
    }


    public class GetSet
    {
        public static bool Insert<TEntity>(TEntity entity)
        {
            try
            {
                using (SQLiteConnection connection = new(DbService.DBPath))
                {
                    connection.Insert(entity);
                }
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error Inserting Data: {ex.Message}");
                return false;
            }
        }


        public static List<Upload> GetAllUploads()
        {
            try
            {
                using (SQLiteConnection connection = new(DbService.DBPath))
                {
                    return connection.Query<Upload>("SELECT * FROM Upload").ToList();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving terms: {ex.Message}");
                return [];
            }
        }

        public static List<Upload> GetAll(Upload uploads)
        {
            try
            {
                using (SQLiteConnection connection = new(DbService.DBPath))
                {
                    return connection.Query<Upload>("SELECT * FROM Upload").ToList();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving terms: {ex.Message}");
                return [];
            }
        }

        public static List<User> GetAll(User users)
        {
            try
            {
                using (SQLiteConnection connection = new(DbService.DBPath))
                {
                    return connection.Query<User>("SELECT * FROM User").ToList();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving terms: {ex.Message}");
                return [];
            }
        }
















    }



}
