using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Resume_QR_Code_Verification_System.Server;
using Resume_QR_Code_Verification_System.Server.Models;
using Resume_QR_Code_Verification_System.Server.Models.DTOs;
using Resume_QR_Code_Verification_System.Server.Services;
using System;
using System.Net.Mime;

namespace Resume_QR_Code_Verification_System.Server.Controller
{
    [ApiController]
    //[Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        //for testing only
        [HttpGet("test")]
        public string Get() => "Hello world";


        
        //UploadCreateDto
        [HttpPost("files")]
        [RequestSizeLimit(50_000_000)] // 50MB max
        [Consumes("multipart/form-data")] // Explicitly accept form-data
        public async Task<IActionResult> CreateUpload([FromForm] UploadCreateDto model)//???
        {
            try
            {
                // Validate
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                if (model.File == null || model.File.Length == 0)
                {
                    return BadRequest(new { success = false, error = "No file uploaded" });
                }
                var allowedExtensions = new[] { ".pdf", ".jpg", ".png", ".jpeg" };
                var fileExtension = Path.GetExtension(model.File.FileName).ToLower();

                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = $"Invalid file type. Allowed types: {string.Join(", ", allowedExtensions)}"
                    });
                }





                // Generate safe filename
                var safeFileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(DbService.UploadPath, safeFileName);


                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await model.File.CopyToAsync(stream);
                }


                // Save to database
                Upload newUpload = new Upload(1, model.File.FileName, safeFileName,
                    model.File.ContentType, model.File.Length, model.Description, DateTime.UtcNow, filePath);
                GetSet.Insert(newUpload);
                

                //_context.FileRecords.Add(fileRecord);
                //await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    id = newUpload.Id,
                    name = newUpload.FileName,
                    size = newUpload.FileSize,
                    message = "File uploaded successfully"

                });
            }
            catch (Exception ex)
            {
                // Return consistent error structure
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message,
                    message = "Internal server error"
                });
            }
        }



        [HttpGet("resumes")]
        public IActionResult GetAllResumes()
        {
            List<Upload> Uploads = GetSet.GetAll(new Upload());

            return Ok(Uploads);
        }

    }
}

