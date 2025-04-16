using System.ComponentModel.DataAnnotations;
using System.Reflection.Metadata;

namespace Resume_QR_Code_Verification_System.Server.Models.DTOs
{
    public class CompanyCreateDto
    {

        [Required]
        public string? CompanyName { get; set; }

        public string? Description { get; set; }

    }
    public class CompanyUpdateDto
    {

        [Required]
        public string? CompanyName { get; set; }

        public string? Description { get; set; }

    }
}
