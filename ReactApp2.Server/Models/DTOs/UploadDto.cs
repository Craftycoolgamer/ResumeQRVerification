using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace Resume_QR_Code_Verification_System.Server.Models.DTOs
{
    public class UploadCreateDto
    {

        [Required]
        public string? Name { get; set; }

        [Required]
        public int Company { get; set; }

        [Required]
        public IFormFile? File { get; set; }

        public string? Description { get; set; }

        //public string UploadType { get; set; } // "resume" or "image"

    }

    public class UploadUpdateDto
    {

        public string? Description { get; set; }

    }
}
