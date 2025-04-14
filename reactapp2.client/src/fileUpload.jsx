import React, { useState, useCallback } from "react";
import axios from 'axios';
import "./fileUpload.css";
import QRCode from 'qrcode';

const FileUploadDropArea = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        experience: ''
    });
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [description, setDescription] = useState("");
    const [error, setError] = useState(null);
    //const [qrCodeData, setQrCodeData] = useState(null);

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

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpload = async () => {
        //testing only
        //axios.get('https://localhost:7219/test')
        //    .then(r => console.log(r.data))

        if (!file) return;

        //TODO: verify there is forum data

        const uploadData = new FormData();
        // Append form data
        Object.entries(formData).forEach(([key, value]) => {
            uploadData.append(key, value);
        });
        // Append file data
        uploadData.append('File', file);
        if (description == "") {
            uploadData.append('Description', "none");
        } else { uploadData.append('Description', description); }
        

        try {
            setUploadStatus('uploading');
            setUploadProgress(0);

            // Send data to backend (matches UploadCreateDto structure)
            const API_URL = 'https://localhost:7219/api/resumes'; 
            const response = await axios.post(API_URL, uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                }
            });

            // Generate QR code after successful upload
            const qrCodeDataURL = await QRCode.toDataURL(
                `https://localhost:7219/api/verify/${response.data.id}`
            );

            // Create download link
            const link = document.createElement('a');
            link.download = `QR_${response.data.id}.png`;
            link.href = qrCodeDataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);



            console.log('Upload success:', response.data);
            //setQrCodeData(response.data.id);
            //setUploadStatus(null);
            setUploadStatus('success');
            resetForm();
        } catch (error) {
            //console.error('Upload failed:', error.response.data || error.message);
            setUploadStatus('error');
            setError(error);

            if (error.response) {
                // The request was made and the server responded with a status code
                console.error('Server responded with:', error.response.status);
                console.error('Response data:', error.response.data);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
            } else {
                // Something happened in setting up the request
                console.error('Request setup error:', error.message);
            }
            //setUploadStatus(null);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            experience: ''
        });
        setUploadStatus(null);
        setFile(null);
        setDescription('');
        setUploadProgress(0);
        
    };



    return (
        <div className="container">
            <div className="form-container">
                <div className="form-row">
                    <label className="form-label">Full Name:</label>
                    <input
                        className="form-input"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-row">
                    <label className="form-label">Email:</label>
                    <input
                        className="form-input"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-row">
                    <label className="form-label">Phone:</label>
                    <input
                        className="form-input"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-row">
                    <label className="form-label">Years of Experience:</label>
                    <input
                        className="form-input"
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div className="title">Attach a document.</div>
            <div className="drop-zone-container">
                <div
                    className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input').click()}
                >
                    {file ? (
                        <div className="file-info">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                    ) : (
                        "Drag & drop Resume, or click to browse"
                    )}
                    <input
                        id="file-input"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            {file && (
                <textarea
                    className="description-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="File description..."
                />
            )}

            {uploadStatus === 'uploading' && (
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${uploadProgress}%` }}
                    />
                    <span className="progress-text">{uploadProgress}%</span>
                </div>
            )}

            {uploadStatus === 'success' && (
                <div className="status-message status-success">Upload successful! QR code downloaded automatically.</div>
            )}

            {uploadStatus === 'error' && (
                <div className="status-message status-error">Upload failed. {error.response.data.error}</div>
            )}

            {/*{file && !uploadStatus && (*/}
            <div className="button-container">
                {file && (
                    <button className="upload-button" onClick={handleUpload}>Upload</button>
                )}
                <button className="cancel-button" onClick={resetForm}>Cancel</button>
            </div>
        </div>
    );
};


export default FileUploadDropArea;