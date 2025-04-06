using System.ComponentModel.DataAnnotations;
using System.Reflection.Metadata;

namespace Resume_QR_Code_Verification_System.Server.Models.DTOs
{
    public class UploadCreateDto
    {

        [Required]
        public string? Name { get; set; }

        [Required]
        [EmailAddress]
        public string? Email { get; set; }

        [Required]
        [Phone]
        public string? Phone { get; set; }

        [Required]
        [Range(0, 50)]
        public int Experience { get; set; }

        [Required]
        public IFormFile? File { get; set; }

        public string? Description { get; set; }

    }
}
