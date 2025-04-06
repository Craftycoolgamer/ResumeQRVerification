using System.ComponentModel.DataAnnotations;
using System.Reflection.Metadata;

namespace Resume_QR_Code_Verification_System.Server.Models
{
    public class Resume
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string? FileName { get; set; }

        [Required]
        public string? StoredFileName { get; set; }

        [Required]
        public string? ContentType { get; set; }

        [Required]
        public long FileSize { get; set; }

        public string? Description { get; set; }

        [Required]
        public DateTime UploadDate { get; set; } = DateTime.UtcNow;

        [Required]
        public string? FilePath { get; set; }
    }
}
