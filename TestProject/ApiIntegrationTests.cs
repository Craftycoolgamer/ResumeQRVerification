using Xunit;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using YourProject.Tests;
using Resume_QR_Code_Verification_System.Server;
using Resume_QR_Code_Verification_System.Server.Models.DTOs;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Moq;

namespace YourProject.Tests.IntegrationTests
{
    public class LoginResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        // Add other properties as needed
    }


    public class ApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public ApiIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task Get_Companies_ReturnsSuccess()
        {
            // Act
            var response = await _client.GetAsync("/api/companies");

            // Assert
            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json",
                response.Content.Headers.ContentType?.MediaType);
        }

        [Fact]
        public async Task Login_ValidCredentials_ReturnsSuccess()
        {
            // Arrange
            var dto = new UserLoginDto { Username = "test", Password = "test" };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/login", dto);

            // Assert
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadFromJsonAsync<LoginResponse>();
            Assert.True((bool)content.Success);
        }

        [Fact]
        public async Task Upload_ValidFile_ReturnsSuccess()
        {
            // Arrange
            var imageContent = new byte[] { 0x89, 0x50, 0x4E, 0x47 };
            var fileContent = new byte[] { 0x25, 0x50, 0x44, 0x46 }; // PDF header bytes
            var fileName = "test.pdf";
            var stream = new MemoryStream(fileContent);

            var file = new Mock<IFormFile>();
            file.Setup(f => f.FileName).Returns(fileName);
            file.Setup(f => f.ContentType).Returns("application/pdf");
            file.Setup(f => f.Length).Returns(stream.Length);
            file.Setup(f => f.OpenReadStream()).Returns(stream);

            var dto = new UploadCreateDto
            {
                Company = 1,
                Name = "Test User",
                File = file.Object
            };

            // Create proper multipart content
            using var formContent = new MultipartFormDataContent
            {
                { new StringContent(dto.Company.ToString()), "Company" },
                { new StringContent(dto.Name), "Name" },
                { new StreamContent(file.Object.OpenReadStream()), "File", fileName }
            };

            // Act
            var response = await _client.PostAsync("/api/resumes", formContent);

            // Assert
            response.EnsureSuccessStatusCode();
        }
    }
}