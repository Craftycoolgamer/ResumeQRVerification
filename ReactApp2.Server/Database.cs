using Microsoft.EntityFrameworkCore;
using Resume_QR_Code_Verification_System.Server.Controllers;
using Resume_QR_Code_Verification_System.Server.Models;
using System;

namespace Resume_QR_Code_Verification_System.Server
{
    public class AppDbContext : DbContext
    {
        //dbSet<products>
        //dbSet<users>

        //TODO: switch over to sqlite

        public DbSet<Resume> FileRecords { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Resume>().ToTable("FileRecords");
        }


    }

    public class Database
    {
        //Upload table
        //User table
    }



}
