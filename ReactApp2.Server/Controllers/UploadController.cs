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

        public UploadController(AppDbContext context)
        {
            _context = context;
            _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");

            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        [HttpGet("test")]
        public string Get() => "Hello world";



        //[FromBody]
        //UploadCreateDto UploadDto
        [HttpPost("files")]
        public async Task<IActionResult> CreateUpload()
        {
            try
            {
                var file = Request.Form.Files[0];
                if (file == null || file.Length == 0)
                    return BadRequest("No file uploaded");

                // Generate unique filename
                var storedFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(_uploadPath, storedFileName);

                // Save file to disk
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Save record to database
                var fileRecord = new Resume
                {
                    FileName = file.FileName,
                    StoredFileName = storedFileName,
                    ContentType = file.ContentType,
                    FileSize = file.Length,
                    Description = Request.Form["description"],
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

            //if (!ModelState.IsValid)
            //{
            //    return BadRequest(ModelState); // Returns validation errors
            //}

            //// Map DTO to domain model
            //var upload = new Resume
            //{
            //    Name = UploadDto.Name,
            //    Resumefile = UploadDto.Resume,
            //    CreatedDate = DateTime.UtcNow
            //};

            //await _uploadService.CreateUpload(upload);
            //return Ok(); // 200 status code
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
