import React, { useState, useCallback } from "react";
import axios from 'axios';
import styled from "styled-components";


const FileUploadDropArea = () => {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [description, setDescription] = useState("");

    // Drag and drop handlers
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);
    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    }, []);
    const handleFileChange = useCallback((e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    }, []);
    

    //Example Code
    //const createProduct = async () => {
    //    const newProduct = { name: "Laptop", price: 999 }; // Plain JS object
    //    await axios.post("https://api.yoursite.com/products", newProduct); // Sends JSON
    //};

    //// Add drag-and-drop
    //const onDrop = useCallback(acceptedFiles => {
    //    setFile(acceptedFiles[0]);
    //}, []);

    //const { getRootProps, getInputProps } = useDropzone({ onDrop });
    

    const handleUpload = async () => {
        //testing only
        //axios.get('https://localhost:7219/test')
        //    .then(r => console.log(r.data))

        if (!file) return;

        const UploadData = new FormData();
        UploadData.append('file', file);
        UploadData.append('fileName', file.name);
        UploadData.append('fileSize', file.size.toString());
        UploadData.append('contentType', file.type);
        UploadData.append('description', description);

        try {
            setUploadStatus('uploading');
            setUploadProgress(0);
            // Send data to backend (matches UploadCreateDto structure)
            const API_URL = 'https://localhost:7219/files'; 

            const response = await axios.post(API_URL, UploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                }
            });

            console.log('Upload success:', response.data);
            setUploadStatus('success');
            resetForm();
        } catch (error) {
            console.error('Upload failed:', error.response?.data || error.message);
            setUploadStatus('error');
        }
    };

    const resetForm = () => {
        setFile(null);
        setDescription('');
        setUploadProgress(0);
        setUploadStatus(null);
    };



    return (
        <Container>
            <Title>Attach a document.</Title>
            <DropZoneContainer>
                <DropZone
                    isDragging={isDragging}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input').click()}
                >
                    {file ? (
                        <FileInfo>
                            <FileName>{file.name}</FileName>
                            <FileSize>{(file.size / 1024 / 1024).toFixed(2)} MB</FileSize>
                        </FileInfo>
                    ) : (
                        "Drag & drop Resume, or click to browse"
                    )}

                    <input
                        id="file-input"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </DropZone>
            </DropZoneContainer>

            {file && (
                <DescriptionInput
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="File description..."
                />
            )}

            {uploadStatus === 'uploading' && (
                <ProgressBar>
                    <ProgressFill progress={uploadProgress} />
                    <ProgressText>{uploadProgress}%</ProgressText>
                </ProgressBar>
            )}

            {uploadStatus === 'success' && (
                <StatusMessage success>Upload successful!</StatusMessage>
            )}

            {uploadStatus === 'error' && (
                <StatusMessage>Upload failed. Please try again.</StatusMessage>
            )}

            <ButtonContainer>
                {file && !uploadStatus && (
                    <UploadButton onClick={handleUpload}>Upload</UploadButton>
                )}
                <CancelButton onClick={resetForm}>Cancel</CancelButton>
            </ButtonContainer>
        </Container>
    );
};


// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
  padding: 20px;
  margin: 0 20px;
  min-width: 120px;
  max-width: 1000px;
  
  width: 100%;
  box-sizing: border-box;
`;
const Title = styled.div`
  font-size: 16px;
  margin-bottom: 20px;
  color: #333;
`;
const DropZoneContainer = styled.div`
  width: 100%;
  padding: 2px; /* This creates space for the border without affecting width */
  margin-bottom: 20px;
`;
const DropZone = styled.div`
  border: 2px dashed ${props => props.isDragging ? '#999' : '#ccc'};
  border-radius: 4px;
  padding: 30px;
  text-align: center;
  margin-bottom: 20px;
  width: 100%;
  color: #666;
  cursor: pointer;
  background-color: ${props => props.isDragging ? '#f5f5f5' : 'transparent'};
  transition: all 0.2s ease;
  box-sizing: border-box; /* Ensures padding is included in width calculation */
`;
const FileInfo = styled.div`
  display: flex;
  flex-direction: column;
`;
const FileName = styled.span`
  font-weight: bold;
  margin-bottom: 5px;
  word-break: break-word;
`;
const FileSize = styled.span`
  font-size: 12px;
  color: #888;
`;
const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;
const UploadButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #45a049;
  }
`;
const CancelButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    color: #333;
  }
`;
const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  background-color: #f1f1f1;
  border-radius: 4px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
`;
const ProgressFill = styled.div`
  width: ${props => props.progress}%;
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease;
`;
const ProgressText = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #333;
  font-size: 12px;
`;
const StatusMessage = styled.div`
  margin-bottom: 20px;
  color: ${props => props.success ? '#4CAF50' : '#f44336'};
  font-size: 14px;
`;
const DescriptionInput = styled.textarea`
  width: 100%;
  padding: 8px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 60px;
  font-family: Arial, sans-serif;
`;


export default FileUploadDropArea;