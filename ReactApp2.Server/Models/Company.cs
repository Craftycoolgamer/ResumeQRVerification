using SQLite;

namespace Resume_QR_Code_Verification_System.Server.Models
{
    [Table("Company")]
    public class Company
    {
        public Company() { }

        [PrimaryKey, AutoIncrement]
        public int Id { get; set; }

        [MaxLength(255)]
        public string? CompanyName { get; set; }

    }
}
