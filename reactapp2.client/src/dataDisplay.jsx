import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './dataDisplay.css';

const DataDisplayArea = () => {
    // Sample data - replace with your actual data source
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            //axios.get('https://localhost:7219/test')
            //    .then(r => console.log(r.data))

            try {
                const response = await axios.get('https://localhost:7219/api/resumes');
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
                    <div className="header-cell">Action</div>
                </div>

                {filteredData.map((item) => (
                    <div key={item.id} className="table-row">
                        <div className="table-cell">{item.fileName}</div>
                        <div className="table-cell">{item.description || "No description"}</div>
                        <div className="table-cell">{item.uploadDate}</div>
                        <div className="table-cell">{item.fileSize}</div>
                        <div className="table-cell">
                            <button className="download-button" onClick={() => handleDownload(item.id, item.fileName)}> Download </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DataDisplayArea;