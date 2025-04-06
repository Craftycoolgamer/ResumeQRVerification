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
                const response = await axios.get('https://localhost:7219/resumes');
                const result = response.data; // Axios automatically parses JSON

                // Map backend fields to frontend display
                const mappedData = result.map(item => ({
                    id: item.id,
                    fileName: item.fileName,
                    description: item.description,
                    uploadDate: new Date(item.uploadDate).toLocaleDateString(),
                    fileSize: `${Math.round(item.fileSize / 1024)} KB`
                }));

                setData(mappedData);
            } catch (err) {
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
                </div>

                {filteredData.map((item) => (
                    <div key={item.id} className="table-row">
                        <div className="table-cell">{item.fileName}</div>
                        <div className="table-cell">{item.description}</div>
                        <div className="table-cell">{item.uploadDate}</div>
                        <div className="table-cell">{item.fileSize}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DataDisplayArea;