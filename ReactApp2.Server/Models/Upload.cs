using SQLite;

namespace Resume_QR_Code_Verification_System.Server.Models
{

    [Table("Upload")]
    public class Upload
    {
        [PrimaryKey, AutoIncrement]
        public int Id { get; set; }

        // Common properties
        public int CompanyId { get; set; }
        public string? FullName { get; set; }
        public string? FileName { get; set; }
        public string? StoredFileName { get; set; }
        public string? ContentType { get; set; }
        public long FileSize { get; set; }
        public string? Description { get; set; }
        public DateTime UploadDate { get; set; } = DateTime.UtcNow;
        public DateTime? ScannedDate { get; set; }
        public string? FilePath { get; set; }
        public bool Verified { get; set; }

        // Virtual method for polymorphism
        public virtual bool Validate() => false;
    }

    [Table("Upload")]
    public class ResumeUpload : Upload
    {
        public override bool Validate()
        {
            var allowedExtensions = new[] { ".pdf", ".docx" };
            return allowedExtensions.Contains(Path.GetExtension(FileName).ToLower());
        }
    }
    [Table("Upload")]
    public class ImageUpload : Upload
    {
        public override bool Validate()
        {
            var allowedExtensions = new[] { ".jpg", ".png", ".jpeg" };
            return allowedExtensions.Contains(Path.GetExtension(FileName).ToLower());
        }
    }
    
}
