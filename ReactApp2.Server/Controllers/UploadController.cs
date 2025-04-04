using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Resume_QR_Code_Verification_System.Server;
using Resume_QR_Code_Verification_System.Server.Models;
using Resume_QR_Code_Verification_System.Server.Models.DTOs;
using Resume_QR_Code_Verification_System.Server.Services;
using System;

namespace Resume_QR_Code_Verification_System.Server.Controller
{
    [ApiController]
    //[Route("api/upload")]
    //[Route("files")]
    public class UploadController : ControllerBase
    {
        //private readonly IUploadService? _uploadService;
        private readonly AppDbContext _context;
        private readonly string _uploadPath;

        public UploadController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _uploadPath = config["FileStorage:Path"] ?? Path.Combine(Directory.GetCurrentDirectory(), "Uploads");

            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        //[HttpGet("test")]
        //public string Get() => "Hello world";

        //// Validate file extensions
        //private static readonly string[] _allowedExtensions = { ".pdf", ".jpg", ".png" };

        //if (!_allowedExtensions.Contains(fileExt.ToLower()))
        //    return BadRequest("File type not allowed");


        //[FromBody]
        //UploadCreateDto UploadDto
        [HttpPost("files")]
        [RequestSizeLimit(50_000_000)] // 50MB max
        public async Task<IActionResult> CreateUpload([FromBody] UploadCreateDto model)//???
        {
            try
            {
                // Validate
                if (model.File == null || model.File.Length == 0)
                    return BadRequest(new { success = false, error = "No file uploaded" });

                // Generate safe filename
                var fileExt = Path.GetExtension(model.File.FileName);
                var safeFileName = $"{Guid.NewGuid()}{fileExt}";
                var filePath = Path.Combine(_uploadPath, safeFileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await model.File.CopyToAsync(stream);
                }

                // Save to database
                var fileRecord = new Resume
                {
                    FileName = model.File.FileName,
                    StoredFileName = safeFileName,
                    ContentType = model.File.ContentType,
                    FileSize = model.File.Length,
                    Description = model.Description,
                    UploadDate = DateTime.UtcNow,
                    FilePath = filePath
                };

                _context.FileRecords.Add(fileRecord);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    id = fileRecord.Id,
                    name = fileRecord.FileName,
                    size = fileRecord.FileSize,
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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFile(int id)
        {
            var fileRecord = await _context.FileRecords.FindAsync(id);
            if (fileRecord == null)
                return NotFound();

            var fileStream = System.IO.File.OpenRead(fileRecord.FilePath);
            return File(fileStream, fileRecord.ContentType, fileRecord.FileName);
        }







        //[HttpPut("/{id}")]
        //public IActionResult UpdateUpload(int id, [FromBody] UploadUpdateDto UploadDto)
        //{
        //    // This method ONLY accepts `UploadUpdateDto`
        //    // React must send JSON that matches this DTO
        //}



    }
}

