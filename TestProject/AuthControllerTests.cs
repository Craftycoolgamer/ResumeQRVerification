using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Resume_QR_Code_Verification_System.Server.Controller;
using Resume_QR_Code_Verification_System.Server.Models;
using Resume_QR_Code_Verification_System.Server.Models.DTOs;
using Resume_QR_Code_Verification_System.Server;


namespace YourProject.Tests.UnitTests
{
    public class AuthControllerTests
    {
        private readonly Mock<IGetSet> _mockGetSet = new Mock<IGetSet>();
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _controller = new AuthController(_mockGetSet.Object);
        }

        [Fact]
        public void Login_InvalidModel_ReturnsBadRequest()
        {
            // Arrange
            _controller.ModelState.AddModelError("error", "error");
            var dto = new UserLoginDto();

            // Act
            var result = _controller.Login(dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void Login_InvalidCredentials_ReturnsUnauthorized()
        {
            // Arrange
            var dto = new UserLoginDto { Username = "test", Password = "wrong" };
            _mockGetSet.Setup(x => x.GetAll<User>())
                .Returns(new List<User> { new User { Username = "test", PasswordHash = BCrypt.Net.BCrypt.HashPassword("correct") } });

            // Act
            var result = _controller.Login(dto);

            // Assert
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public void Register_ExistingUsername_ReturnsBadRequest()
        {
            // Arrange
            var dto = new UserRegisterDto { Username = "existing" };
            _mockGetSet.Setup(x => x.GetAll<User>())
                .Returns(new List<User> { new User { Username = "existing" } });

            // Act
            var result = _controller.Register(dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void GetUserById_ValidId_ReturnsUser()
        {
            // Arrange
            var testUser = new User { Id = 1, Username = "test" };
            _mockGetSet.Setup(x => x.GetById<User>(1)).Returns(testUser);

            // Act
            var result = _controller.GetUserById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(testUser, okResult.Value);
        }
    }
}