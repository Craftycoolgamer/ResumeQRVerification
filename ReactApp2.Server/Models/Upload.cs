using SQLite;

namespace Resume_QR_Code_Verification_System.Server.Models
{
    [Table("Upload")]
    public class Upload
    {

        public Upload() : base() { }
        
        public Upload(int companyId, string fileName, string storedFileName, string contentType,
                      long fileSize, string? description, string filePath) 
        {
            CompanyId = companyId;
            FileName = fileName;
            StoredFileName = storedFileName;
            ContentType = contentType;
            FileSize = fileSize;
            Description = description;
            FilePath = filePath;
        }



        [PrimaryKey, AutoIncrement]
        public int Id { get; set; }

        //[Indexed] // Improves query performance for foreign key
        public int CompanyId { get; set; }

        public bool Verified { get; set; } = false;

        [NotNull]
        public string FileName { get; set; }

        public string? StoredFileName { get; set; }

        public string? ContentType { get; set; }

        public long? FileSize { get; set; }

        public string? Description { get; set; }

        public DateTime? UploadDate { get; set; } = DateTime.UtcNow;

        public DateTime? ScannedDate { get; set; }

        public string? FilePath { get; set; }
    }
}
