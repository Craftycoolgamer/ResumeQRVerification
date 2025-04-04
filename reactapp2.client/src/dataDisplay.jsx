import React, { useState } from 'react';
import './dataDisplay.css';

const DataDisplayArea = () => {
    // Sample data - replace with your actual data source
    const [data] = useState([
        { id: 1, name: 'John Doe', position: 'Developer', revenue: '$100,000' },
        { id: 2, name: 'Jane Smith', position: 'Designer', revenue: '$90,000' },
        { id: 3, name: 'Mike Johnson', position: 'Manager', revenue: '$120,000' },
        { id: 4, name: 'Sarah Williams', position: 'Analyst', revenue: '$85,000' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    // Filter data based on search term
    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.revenue.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleScan = () => {
        // Add your scan functionality here
        alert('Scan button clicked!');
    };

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
                    <div className="header-cell">Name</div>
                    <div className="header-cell">Position</div>
                    <div className="header-cell">Revenue</div>
                </div>

                {filteredData.map((item) => (
                    <div key={item.id} className="table-row">
                        <div className="table-cell">{item.name}</div>
                        <div className="table-cell">{item.position}</div>
                        <div className="table-cell">{item.revenue}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DataDisplayArea;