using SQLite;
using System.ComponentModel.DataAnnotations;

namespace Resume_QR_Code_Verification_System.Server.Models
{
    [Table("User")]
    public class User
    {
        public User() { }

        [PrimaryKey, AutoIncrement]
        public int Id { get; set; }

        public int CompanyId { get; set; }

        public string? Username { get; set; }

        public string? PasswordHash { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
}
