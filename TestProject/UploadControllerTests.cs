using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Resume_QR_Code_Verification_System.Server.Controller;
using Resume_QR_Code_Verification_System.Server.Models;
using Resume_QR_Code_Verification_System.Server.Models.DTOs;
using System.IO;
using Microsoft.AspNetCore.Http;
using Resume_QR_Code_Verification_System.Server;

namespace YourProject.Tests.UnitTests
{
    public class UploadControllerTests
    {
        private readonly Mock<IGetSet> _mockGetSet = new Mock<IGetSet>();
        private readonly UploadController _controller;

        public UploadControllerTests()
        {
            _controller = new UploadController(_mockGetSet.Object);
        }

        [Fact]
        public async Task CreateUpload_NoFile_ReturnsBadRequest()
        {
            // Arrange
            var dto = new UploadCreateDto { File = null };

            // Act
            var result = await _controller.CreateUpload(dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void DownloadFile_NonExistentId_ReturnsNotFound()
        {
            // Arrange
            _mockGetSet.Setup(x => x.GetById<Upload>(1)).Returns((Upload)null);

            // Act
            var result = _controller.DownloadFile(1);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public void DeleteFile_ValidId_ReturnsSuccess()
        {
            // Arrange
            var upload = new Upload { Id = 1, FilePath = "test.pdf" };
            _mockGetSet.Setup(x => x.GetById<Upload>(1)).Returns(upload);
            _mockGetSet.Setup(x => x.Delete<Upload>(1)).Returns(true);

            // Act
            var result = _controller.DeleteFile(1);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }
    }
}