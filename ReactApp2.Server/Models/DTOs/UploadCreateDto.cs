using System.ComponentModel.DataAnnotations;
using System.Reflection.Metadata;

namespace Resume_QR_Code_Verification_System.Server.Models.DTOs
{
    public class UploadCreateDto
    {

        [Required]
        public string? Name { get; set; }

        //[Range(0.01, double.MaxValue)]
        public Blob Resume { get; set; }

    }
}
