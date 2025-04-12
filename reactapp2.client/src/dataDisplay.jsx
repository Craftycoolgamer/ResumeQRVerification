import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './dataDisplay.css';

const DataDisplayArea = () => {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [editDescription, setEditDescription] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            //axios.get('https://localhost:7219/test')
            //    .then(r => console.log(r.data))

            try {
                const response = await axios.get('https://localhost:7219/api/upload/resumes');
                const result = response.data; // Axios automatically parses JSON
                //console.log("Result: ", result);

                // Map backend fields to frontend display
                const mappedData = result.map(item => ({
                    id: item.id, 
                    fileName: item.fileName,
                    description: item.description,
                    uploadDate: new Date(item.uploadDate).toLocaleDateString(),
                    fileSize: `${Math.round(item.fileSize / 1024)} KB`
                }));
                //console.log("Mapped Data: ", mappedData);

                setData(mappedData);
                
            } catch (err) {
                console.error("API Error:", err); // Log detailed error
                setError(err.message);

                
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter data based on search term
    const filteredData = data.filter(item =>
        item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleScan = () => {
        // Add your scan functionality here
        alert('Scan button clicked!');
    };

    const handleDownload = async (id, fileName) => {
        try {
            const response = await axios.get(
                `https://localhost:7219/api/download/${id}`,
                { responseType: 'blob' }
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Failed to download file: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this resume?')) {
            try {
                await axios.delete(`https://localhost:7219/api/delete/${id}`);
                setData(data.filter(item => item.id !== id));
            } catch (error) {
                alert('Delete failed: ' + error.message);
            }
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setEditDescription(item.description);
    };

    const handleUpdate = async () => {
        try {
            await axios.put(
                `https://localhost:7219/api/update/${editingItem.id}`,
                { description: editDescription }
            );

            setData(data.map(item =>
                item.id === editingItem.id
                    ? { ...item, description: editDescription }
                    : item
            ));
            setEditingItem(null);
        } catch (error) {
            alert('Update failed: ' + error.message);
        }
    };

    const handleView = async (id) => {
        try {
            const response = await axios.get(`https://localhost:7219/api/preview/${id}`, {
                responseType: 'blob'
            });

            // Create object URL from blob
            const url = URL.createObjectURL(response.data);
            setPreviewUrl(url);
        } catch (error) {
            alert('Failed to preview file: ' + error.message);
        }
    };

    if (loading) return <div className="content-container">Loading resumes...</div>;
    if (error) {
        return (
            <div className="content-container">
                <div className="error-message">
                    Failed to load data: {error}
                    <button onClick={() => window.location.reload()}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="content-container">
            <div className="right-controls">
                <button className="scan-button" onClick={handleScan}>
                    Scan Resumes
                </button>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="data-rectangle">
                <div className="table-header">
                    <div className="header-cell">File Name</div>
                    <div className="header-cell">Description</div>
                    <div className="header-cell">Upload Date</div>
                    <div className="header-cell">Size</div>
                    <div className="header-cell">Actions</div>
                </div>

                {filteredData.map((item) => (
                    <div key={item.id} className="table-row">
                        <div className="table-cell" data-label="File Name">{item.fileName}</div>
                        <div className="table-cell">{item.description || "No description"}</div>
                        <div className="table-cell">{item.uploadDate}</div>
                        <div className="table-cell">{item.fileSize}</div>
                        <div className="table-cell actions-cell">
                            <button
                                className="action-button view-button"
                                onClick={() => handleView(item.id)}
                            >
                                View
                            </button>
                            <button
                                className="action-button download-button"
                                onClick={() => handleDownload(item.id, item.fileName)}
                            >
                                Download
                            </button>
                            <button
                                className="action-button edit-button"
                                onClick={() => handleEdit(item)}
                            >
                                Edit
                            </button>
                            <button
                                className="action-button delete-button"
                                onClick={() => handleDelete(item.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {editingItem && (
                <div className="edit-modal">
                    <div className="modal-content">
                        <h3>Edit Description</h3>
                        <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                        />
                        <div className="modal-buttons">
                            <button className="action-button save-button" onClick={handleUpdate}>Save</button>
                            <button className="action-button cancelEdit-button" onClick={() => setEditingItem(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {previewUrl && (
                <div className="preview-modal">
                    <div className="preview-content">
                        <button
                            className="closePreview-button"
                            onClick={() => {
                                setPreviewUrl(null);
                                URL.revokeObjectURL(previewUrl);
                            }}
                        >
                            &times;
                        </button>
                        <iframe
                            src={previewUrl}
                            title="File Preview"
                            style={{ width: '100%', height: '90%' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataDisplayArea;