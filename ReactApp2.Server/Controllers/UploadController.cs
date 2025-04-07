using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Resume_QR_Code_Verification_System.Server;
using Resume_QR_Code_Verification_System.Server.Models;
using Resume_QR_Code_Verification_System.Server.Models.DTOs;
using Resume_QR_Code_Verification_System.Server.Services;
using System;
using System.Net.Mime;
using System.IO;

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
        [HttpPost("api/files")]
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
                
                //TODO: Validate input field (phone, email)


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

        //Update an Entity
        //var success = GetSet.Update(modifiedUpload);
        

        [HttpGet("api/resumes")]
        public IActionResult GetAllResumes()
        {
            var Uploads = GetSet.GetAll<Upload>();
            return Ok(Uploads);
        }

        [HttpGet("api/download/{id}")]
        public IActionResult DownloadResume(int id)
        {
            try
            {
                // Get the upload record
                var upload = GetSet.GetById<Upload>(id);
                if (upload == null) return NotFound("File record not found");

                // Verify physical file exists
                if (!System.IO.File.Exists(upload.FilePath))
                    return NotFound("File not found on server");

                // Create file stream
                var fileStream = System.IO.File.OpenRead(upload.FilePath);

                // Return file with proper content type and original filename
                return File(fileStream, upload.ContentType, upload.FileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message,
                    message = "Error downloading file"
                });
            }
        }

        [HttpGet("api/delete/{id}")]
        public IActionResult DeleteResume(int id)
        {
            try
            {
                var upload = GetSet.GetById<Upload>(id);
                if (upload == null) return NotFound("File not found");

                // Delete database record
                bool dbSuccess = GetSet.Delete<Upload>(id);

                // Delete physical file
                if (System.IO.File.Exists(upload.FilePath))
                {
                    System.IO.File.Delete(upload.FilePath);
                }

                return dbSuccess ? Ok(new { success = true })
                                : StatusCode(500, new { success = false });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message,
                    message = "Error deleting file"
                });
            }
        }

        [HttpPut("api/update/{id}")]
        public IActionResult UpdateResume(int id, [FromBody] UploadUpdateDto dto)
        {
            try
            {
                var upload = GetSet.GetById<Upload>(id);
                if (upload == null) return NotFound("File not found");

                // Update only allowed fields
                upload.Description = dto.Description;

                bool success = GetSet.Update(upload);
                return success ? Ok(new { success = true })
                              : StatusCode(500, new { success = false });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message,
                    message = "Error updating file"
                });
            }
        }



    }
}

