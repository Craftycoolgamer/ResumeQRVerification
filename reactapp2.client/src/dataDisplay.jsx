import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './dataDisplay.css';
import QrScanner from './QrScanner';

const DataDisplayArea = () => {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [editDescription, setEditDescription] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [scanning, setScanning] = useState(false);

    const [showReportsDropdown, setShowReportsDropdown] = useState(false);
    const [reportType, setReportType] = useState(null);
    const [reportData, setReportData] = useState([]);

    const [selectedCompany, setSelectedCompany] = useState(null);
    const [showCompanyModal, setShowCompanyModal] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [newCompanyDescription, setNewCompanyDescription] = useState('');

    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');


    //TODO: use the filename for qrcode instead of id, then when scanned get the id then use the axios put id

    useEffect(() => {
        const fetchData = async () => {

            try {
                const response = await axios.get('https://localhost:7219/api/resumes');
                const result = response.data; // Axios automatically parses JSON

                // Map backend fields to frontend display
                const mappedData = result.map(item => (
                    {
                    id: item.id, 
                    companyId: item.companyId,
                    fileName: item.fileName,
                    description: item.description,
                    uploadDate: new Date(item.uploadDate),
                    fileSize: `${Math.round(item.fileSize / 1024)} KB`,
                    verified: item.verified
                }));
                setData(mappedData);
            } catch (err) {
                console.error("API Error:", err); // Log detailed error
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchCompanies = async () => {
            try {
                const response = await axios.get('https://localhost:7219/api/companies');
                setCompanies(response.data);
            } catch (error) {
                alert('Failed to load companies: ' + error.message);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await axios.get('https://localhost:7219/api/users');
                setUsers(response.data);
            } catch (error) {
                alert('Failed to load companies: ' + error.message);
            }
        };


        if (showUserModal) {
            fetchUsers();
        }
        fetchCompanies();
        fetchData();
    }, [showCompanyModal, showUserModal]);

    // Filter data based on search term
    const filteredData = data.filter(item => {
        if (!item.verified) return false;

        const company = companies.find(c => c.id === item.companyId);
        const companyName = company ? company.companyName : 'Unknown';
        const lowerSearch = searchTerm.toLowerCase();

        return (
            item.fileName.toLowerCase().includes(lowerSearch) ||
            (item.description && item.description.toLowerCase().includes(lowerSearch)) ||
            companyName.toLowerCase().includes(lowerSearch)
        );
    });

    const handleScan = () => {
        setScanning(true);
    };
    
    const handleScanResult = async (result) => {
        if (!result) return;

        try {
            // Extract ID from URL format: https://localhost:7219/api/verify/id
            const url = new URL(result);
            const id = url.pathname.split('/').pop();

            await axios.put(`https://localhost:7219/api/verify/${id}`);

            setData(data.map(item =>
                item.id === parseInt(id) ? { ...item, verified: true } : item
            ));

            setScanning(false);
            alert('Verification successful!');
        } catch (error) {
            alert(`Verification failed: ${error.response?.data?.message || error.message}`);
            setScanning(false);
        }
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
                item.id === editingItem.id ? { ...item, description: editDescription } : item
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

    const handleAddCompany = () => {
        setNewCompanyName('');
        setNewCompanyDescription('');
        setShowCompanyModal(true);
    };

    const handleSaveCompany = async () => {
        if (!newCompanyName) {
            alert('Company name is required');
            return;
        }

        try {
            const companyData = {
                CompanyName: newCompanyName,
                Description: newCompanyDescription
            };
            let response;
            if (selectedCompany) {
                response = await axios.put(
                    `https://localhost:7219/api/company/${selectedCompany.id}`,
                    companyData
                );
                setCompanies(companies.map(c => c.id === selectedCompany.id ? response.data : c));
            } else {
                response = await axios.post(
                    'https://localhost:7219/api/companies',
                    companyData
                );
                setCompanies([...companies, response.data]);
            }

            setNewCompanyName('');
            setSelectedCompany(null);
            alert(selectedCompany ? 'Company updated!' : 'Company added!');
        } catch (error) {
            alert(`Operation failed: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleAddUser = () => {
        setNewUsername('');
        setNewPassword('');
        setShowUserModal(true);
    };

    const handleSaveUser = async () => {
        if (!newUsername || !newPassword) {
            alert('Username and Password are required');
            return;
        }

        try {
            const userData = {
                Username: newUsername,
                Password: newPassword
            };
            let response;
            if (selectedUser) {
                response = await axios.put(
                    `https://localhost:7219/api/user/${selectedUser.id}`,
                    userData
                );
                setUsers(users.map(c => c.id === selectedUser.id ? response.data : c));
            } else {
                response = await axios.post(
                    'https://localhost:7219/api/auth/register',
                    userData
                );
                setUsers([...users, response.data]);
            }

            setNewUsername('');
            setNewPassword('');
            setSelectedUser(null);
            alert(selectedUser ? 'updated!' : 'added!');
        } catch (error) {
            alert(`Operation failed: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleReportSelect = (type) => {
        let computedData = [];

        switch (type) {
            case 'company':
                { const companyCounts = data.reduce((acc, item) => {
                    const company = companies.find(c => c.id === item.companyId);
                    const companyName = company ? company.companyName : 'Unknown';
                    acc[companyName] = (acc[companyName] || 0) + 1;
                    return acc;
                }, {});
                computedData = Object.entries(companyCounts).map(([name, count]) => ({
                    name,
                    count
                }));
                break; }

            case 'month':
                { const monthCounts = data.reduce((acc, item) => {
                    const monthYear = item.uploadDate.toLocaleString('default', { month: 'short', year: 'numeric' });
                    acc[monthYear] = (acc[monthYear] || 0) + 1;
                    return acc;
                }, {});
                computedData = Object.entries(monthCounts).map(([period, count]) => ({
                    period,
                    count
                }));
                break; }

            case 'year':
                { const yearCounts = data.reduce((acc, item) => {
                    const year = item.uploadDate.getFullYear();
                    acc[year] = (acc[year] || 0) + 1;
                    return acc;
                }, {});
                computedData = Object.entries(yearCounts).map(([year, count]) => ({
                    year,
                    count
                }));
                    break;
                }
            case 'fileType':
                {
                    const typeCounts = data.reduce((acc, item) => {
                        const type = item.fileName.split('.').pop().toLowerCase();
                        acc[type] = (acc[type] || 0) + 1;
                        return acc;
                    }, {});
                    computedData = Object.entries(typeCounts).map(([type, count]) => ({
                        type,
                        count
                    }));
                    break;
                }

            default:
                break;
        }

        setReportData(computedData);
        setReportType(type);
        setShowReportsDropdown(false);
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
                <button className="add-button" onClick={handleAddCompany}>
                    Add Company
                </button>

                <button className="add-button" onClick={handleAddUser}>
                    Add User
                </button>

                <button className="scan-button" onClick={handleScan}>
                    Scan Resumes
                </button>

                <div className="reports-container">
                    <button
                        className="reports-button"
                        onClick={() => setShowReportsDropdown(!showReportsDropdown)}
                    >
                        Reports ▼
                    </button>
                    {showReportsDropdown && (
                        <div className="reports-dropdown">
                            <button onClick={() => handleReportSelect('company')}>Per Company</button>
                            <button onClick={() => handleReportSelect('fileType')}>Per File Type</button>
                            <button onClick={() => handleReportSelect('month')}>Per Month</button>
                            <button onClick={() => handleReportSelect('year')}>Per Year</button>
                        </div>
                    )}
                </div>
                
                {reportType && (
                    <button
                        className="clear-report-button"
                        onClick={() => {
                            setReportType(null);
                            setReportData([]);
                            setShowReportsDropdown(false);
                        }}
                    >
                        Back to List
                    </button>
                )}

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
                    {reportType ? (
                        <>
                            <div className="header-cell">
                                {reportType === 'company' ? 'Company' :
                                reportType === 'month' ? 'Month' :
                                reportType === 'fileType' ? 'File Type' :
                                'Year'}
                            </div>
                            <div className="header-cell"></div>
                            <div className="header-cell"></div>
                            <div className="header-cell"></div>
                            <div className="header-cell counter">Resume Count</div>
                        </>
                    ) : (
                        // Normal headers
                        <>
                            <div className="header-cell">File Name</div>
                            <div className="header-cell">Description</div>
                            <div className="header-cell">Upload Date</div>
                            <div className="header-cell">Company</div>
                            <div className="header-cell">Verified</div>
                            <div className="header-cell">Actions</div>
                        </>
                    )}
                </div>

                {reportType ? (
                    reportData.map((item, index) => (
                        <div key={index} className="table-row">
                            <div className="table-cell">
                                {reportType === 'company' ? item.name :
                                reportType === 'month' ? item.period :
                                reportType === 'fileType' ? item.type :
                                item.year}
                            </div>
                            <div className="table-cell"></div>
                            <div className="table-cell"></div>
                            <div className="table-cell"></div>
                            <div className="table-cell">{item.count}</div>
                        </div>
                    ))
                ) : (
                    filteredData.map((item) => (
                        // Normal row rendering
                        <div key={item.id} className="table-row">
                            <div className="table-cell" data-label="File Name">{item.fileName}</div>
                            <div className="table-cell">{item.description || "No description"}</div>
                            <div className="table-cell">{item.uploadDate.toLocaleDateString()}</div>
                            <div className="table-cell">
                                {companies.find(c => c.id === item.companyId)?.companyName || 'Unknown'}
                            </div>
                            <div className="table-cell">{item.verified ? '✅' : '❌'}</div>
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
                    ))
                )}
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
            {scanning && (
                <div className="scanner-modal">
                    <div className="scanner-content">
                        <QrScanner
                            onScan={handleScanResult}
                            onError={(error) => console.error('Scanner error:', error)}
                        />
                        <button
                            className="cancel-scan-button"
                            onClick={() => setScanning(false)}
                        >
                            Close Scanner
                        </button>
                    </div>
                </div>
            )}
            {showCompanyModal && (
                <div className="company-modal">
                    <div className="modal-content">
                        <h2>Manage Companies</h2>

                        <div className="form-group">
                            <label>Select Company:</label>
                            <select
                                value={selectedCompany?.id || ''}
                                onChange={(e) => {
                                    const company = companies.find(c => c.id === parseInt(e.target.value));
                                    setSelectedCompany(company || null);
                                    setNewCompanyName(company?.companyName || '');
                                    setNewCompanyDescription(company?.description || '');
                                }}
                            >
                                <option value="">-- Create New Company --</option>
                                {companies.map(company => (
                                    <option key={company.id} value={company.id}>
                                        {company.companyName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Company Name:</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newCompanyName}
                                onChange={(e) => setNewCompanyName(e.target.value)}
                            />
                        </div>

                        <div className="modal-buttons">
                            <button
                                className="action-button delete-button"
                                onClick={async () => {
                                    if (window.confirm(`Delete ${selectedCompany.companyName}?`)) {
                                        try {
                                            await axios.delete(`https://localhost:7219/api/company/${selectedCompany.id}`);
                                            setCompanies(companies.filter(c => c.id !== selectedCompany.id));
                                            setSelectedCompany(null);
                                            setNewCompanyName('');
                                            //setNewCompanyDescription('');
                                        } catch (error) {
                                            alert('Delete failed: ' + error.message);
                                        }
                                    }
                                }}
                                disabled={!selectedCompany}
                            >
                                Delete
                            </button>

                            <div className="right-buttons">
                                <button className="action-button save-button" onClick={handleSaveCompany}>
                                    {selectedCompany ? 'Update' : 'Save'}
                                </button>
                                <button className="cancel-button" onClick={() => setShowCompanyModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showUserModal && (
                <div className="company-modal">
                    <div className="modal-content">
                        <h2>Manage Users</h2>

                        <div className="form-group">
                            <label>Select User:</label>
                            <select
                                value={selectedUser?.id || ''}
                                onChange={(e) => {
                                    const user = users.find(c => c.id === parseInt(e.target.value));
                                    setSelectedUser(user || null);
                                    setNewUsername(user?.username || '');
                                    setNewPassword('');
                                }}
                            >
                                <option value="">-- Create New User --</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Username:</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password:</label>
                            <input
                                type="text" //TODO: not this
                                className="form-input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <div className="modal-buttons">
                            <button
                                className="action-button delete-button"
                                onClick={async () => {
                                    if (window.confirm(`Delete ${selectedUser.username}?`)) {
                                        try {
                                            await axios.delete(`https://localhost:7219/api/user/${selectedUser.id}`);
                                            setUsers(users.filter(c => c.id !== selectedUser.id));
                                            setSelectedUser(null);
                                            setNewUsername('');
                                            setNewPassword('');
                                        } catch (error) {
                                            alert('Delete failed: ' + error.message);
                                        }
                                    }
                                }}
                                disabled={!selectedUser}
                            >
                                Delete
                            </button>

                            <div className="right-buttons">
                                <button className="action-button save-button" onClick={handleSaveUser}>
                                    {selectedUser ? 'Update' : 'Save'}
                                </button>
                                <button className="cancel-button" onClick={() => setShowUserModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}

export default DataDisplayArea;