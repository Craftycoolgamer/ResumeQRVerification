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

        public string? Name { get; set; }

        public string? Password { get; set; }

    }
}
