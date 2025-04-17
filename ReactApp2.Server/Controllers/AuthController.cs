using Microsoft.AspNetCore.Mvc;
using Resume_QR_Code_Verification_System.Server.Models.DTOs;
using Resume_QR_Code_Verification_System.Server.Models;
using BC = BCrypt.Net.BCrypt;
using System;
using static SQLite.SQLite3;

namespace Resume_QR_Code_Verification_System.Server.Controller
{
    

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IGetSet _getSet;

        public AuthController(IGetSet getSet)
        {
            _getSet = getSet;
        }


        [HttpPost("login")]
        public IActionResult Login([FromBody] UserLoginDto loginDto)
        {
            try
            {
                //Console.WriteLine($"Login attempt for: {loginDto.Username}");
                // Validate input
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { success = false, error = "Invalid request format" });
                }
                if (string.IsNullOrEmpty(loginDto.Username) || string.IsNullOrEmpty(loginDto.Password))
                {
                    return BadRequest(new { error = "Username and password are required" });
                }



                // Find user
                var user = _getSet.GetAll<User>()
                    .FirstOrDefault(u => u.Username == loginDto.Username);



                if (user == null || !BC.Verify(loginDto.Password, user.PasswordHash))
                {
                    return Unauthorized(new { success = false, error = "Invalid credentials" });
                }

                // Maybe Generate JWT token here
                return Ok(new
                {
                    success = true,
                    message = "Login successful",
                    user = new
                    {
                        user.Id,
                        user.Username
                    }
                    
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message,
                    message = "Internal server error during authentication"
                });
            }
        }


        [HttpPost("register")]
        public IActionResult Register([FromBody] UserRegisterDto registerDto)
        {
            try
            {
                // Check if username exists
                var existingUser = _getSet.GetAll<User>()
                    .FirstOrDefault(u => u.Username == registerDto.Username);

                if (existingUser != null)
                {
                    return BadRequest(new { success = false, error = "Username already exists" });
                }

                // Create new user
                var newUser = new User
                {
                    Username = registerDto.Username,
                    PasswordHash = BC.HashPassword(registerDto.Password, BC.GenerateSalt(12))
                };

                // Save to database
                var success = _getSet.Insert(newUser);
                //Console.WriteLine(success);

                return success ? CreatedAtAction(nameof(GetUserById), new { id = newUser.Id }, newUser)
                          : StatusCode(500, "Failed to create company");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message,
                    message = "Registration failed"
                });
            }
        }


        [HttpGet("users/{id}")]
        public IActionResult GetUserById(int id)
        {
            var user = _getSet.GetById<User>(id);
            if (user == null) return NotFound();
            return Ok(user);
        }


    }
}
