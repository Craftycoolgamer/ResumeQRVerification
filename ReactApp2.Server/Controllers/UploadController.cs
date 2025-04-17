using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Resume_QR_Code_Verification_System.Server;
using Resume_QR_Code_Verification_System.Server.Models;
using Resume_QR_Code_Verification_System.Server.Models.DTOs;
using System.IO;
using Microsoft.AspNetCore.Authorization;
using BC = BCrypt.Net.BCrypt;

namespace Resume_QR_Code_Verification_System.Server.Controller
{
    //[Authorize]
    [ApiController]
    [Route("api/")]
    public class UploadController : ControllerBase
    {
        private readonly IGetSet _getSet;

        public UploadController(IGetSet getSet)
        {
            _getSet = getSet;
        }

        //for testing only
        //[HttpGet("test")]
        //public string Get() => "Hello world";

        //Post
        [HttpPost("resumes")]
        [RequestSizeLimit(50_000_000)] // 50MB max
        [Consumes("multipart/form-data")] // Explicitly accept form-data
        public async Task<IActionResult> CreateUpload([FromForm] UploadCreateDto dto)//???
        {
            try
            {
                // Validate
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                if (dto.File == null || dto.File.Length == 0)
                {
                    return BadRequest(new { success = false, error = "No file uploaded" });
                }

                var fileExtension = Path.GetExtension(dto.File.FileName).ToLower();
                Console.Write(fileExtension);
                // Generate safe filename
                var safeFileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(DbService.UploadPath, safeFileName);

                Upload newUpload = fileExtension switch
                {
                    ".pdf" or ".docx" => new ResumeUpload
                    {
                        CompanyId = dto.Company,
                        FullName = dto.Name,
                        FileName = dto.File.FileName,
                        StoredFileName = safeFileName,
                        ContentType = dto.File.ContentType,
                        FileSize = dto.File.Length,
                        Description = dto.Description,
                        FilePath = filePath
                    },
                    ".jpg" or ".png" or ".jpeg" => new ImageUpload{
                        CompanyId = dto.Company,
                        FullName = dto.Name,
                        FileName = dto.File.FileName,
                        StoredFileName = safeFileName,
                        ContentType = dto.File.ContentType,
                        FileSize = dto.File.Length,
                        Description = dto.Description,
                        FilePath = filePath
                    },
                    _ => throw new ArgumentException("Invalid upload type")
                };

                if (!newUpload.Validate())
                {
                    return BadRequest(new { success = false, error = "Invalid file type" });
                }

                var success = _getSet.Insert(newUpload);


                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.File.CopyToAsync(stream);
                }

                if (success)
                {
                    return Ok(new
                    {
                        success = true,
                        id = newUpload.Id,
                        name = newUpload.FileName,
                        message = "File uploaded successfully"

                    });
                }
                throw new InvalidOperationException("File uploaded Unsuccessfully");
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

        [HttpPost("companies")]
        public IActionResult CreateCompany([FromBody] CompanyCreateDto dto)
        {
            //Console.WriteLine("yay");
            var newCompany = new Company
            {
                CompanyName = dto.CompanyName,
                Description = dto.Description
            };

            var result = _getSet.Insert(newCompany);
            return result ? CreatedAtAction(nameof(GetCompanyById), new { id = newCompany.Id }, newCompany)
                          : StatusCode(500, "Failed to create company");
        }


        //Get
        [HttpGet("resumes")]
        public IActionResult GetAllResumes()
        {
            var uploads = _getSet.GetAll<Upload>();
            return Ok(uploads);
        }

        [HttpGet("companies")]
        public IActionResult GetAllCompanies()
        {
            var companies = _getSet.GetAll<Company>();
            return Ok(companies);
        }

        [HttpGet("users")]
        public IActionResult GetAllUsers()
        {
            var users = _getSet.GetAll<User>();
            return Ok(users);
        }

        [HttpGet("companies/{id}")]
        public IActionResult GetCompanyById(int id)
        {
            var company = _getSet.GetById<Company>(id);
            if (company == null) return NotFound();
            return Ok(company);
        }

        [HttpGet("download/{id}")]
        public IActionResult DownloadFile(int id)
        {
            try
            {
                // Get the upload record
                var upload = _getSet.GetById<Upload>(id);
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

        [HttpGet("preview/{id}")]
        public IActionResult PreviewFile(int id)
        {
            try
            {
                var upload = _getSet.GetById<Upload>(id);
                if (upload == null) return NotFound("File record not found");

                if (!System.IO.File.Exists(upload.FilePath))
                    return NotFound("File not found on server");

                var fileStream = System.IO.File.OpenRead(upload.FilePath);
                return File(fileStream, upload.ContentType); // Remove filename to prevent download
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message,
                    message = "Error previewing file"
                });
            }
        }


        //Delete
        [HttpDelete("delete/{id}")]
        public IActionResult DeleteFile(int id)
        {
            try
            {
                var upload = _getSet.GetById<Upload>(id);
                if (upload == null) return NotFound("File not found");

                // Delete database record
                bool dbSuccess = _getSet.Delete<Upload>(id);

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

        [HttpDelete("company/{id}")]
        public IActionResult DeleteCompany(int id)
        {
            //TODO: when deleting company, should also delete any resumes and users associated with it

            var company = _getSet.GetById<Company>(id);
            if (company == null) return NotFound();

            var result = _getSet.Delete<Company>(id);
            //Console.WriteLine(result);
            return result ? NoContent() : StatusCode(500, "Failed to delete Company");
        }

        [HttpDelete("user/{id}")]
        public IActionResult DeleteUser(int id)
        {
            var user = _getSet.GetById<User>(id);
            if (user == null) return NotFound();

            var result = _getSet.Delete<User>(id);
            Console.WriteLine(result);
            return result ? NoContent() : StatusCode(500, "Failed to delete User");
        }


        //Put
        [HttpPut("update/{id}")]
        public IActionResult UpdateFile(int id, [FromBody] UploadUpdateDto dto)
        {
            try
            {
                var upload = _getSet.GetById<Upload>(id);
                if (upload == null) return NotFound("File not found");

                // Update only allowed fields
                upload.Description = dto.Description;

                bool success = _getSet.Update(upload);
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

        [HttpPut("verify/{id}")]
        public IActionResult VerifyFile(int id)
        {
            try
            {
                var upload = _getSet.GetById<Upload>(id);
                if (upload == null) return NotFound("File not found");

                upload.Verified = true;
                upload.ScannedDate = DateTime.UtcNow;
                bool success = _getSet.Update(upload);

                return success ? Ok(new { success = true })
                              : StatusCode(500, new { success = false });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message,
                    message = "Error verifying file"
                });
            }
        }

        [HttpPut("company/{id}")]
        public IActionResult UpdateCompany(int id, [FromBody] CompanyUpdateDto dto)
        {
            var existingCompany = _getSet.GetById<Company>(id);
            if (existingCompany == null) return NotFound();

            existingCompany.CompanyName = dto.CompanyName;
            existingCompany.Description = dto.Description;

            var result = _getSet.Update(existingCompany);
            return result ? Ok(existingCompany) : StatusCode(500, "Failed to update company");
        }

        [HttpPut("user/{id}")]
        public IActionResult UpdateUser(int id, [FromBody] UserUpdateDto dto)
        {
            //TODO: only update if user enters correct old password

            var existingUser = _getSet.GetById<User>(id);
            if (existingUser == null) return NotFound();

            existingUser.Username = dto.Username;
            existingUser.PasswordHash = BC.HashPassword(dto.Password, BC.GenerateSalt(12));

            var result = _getSet.Update(existingUser);
            return result ? Ok(existingUser) : StatusCode(500, "Failed to update company");
        }

    }
}

