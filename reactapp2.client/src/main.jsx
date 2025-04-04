import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './main.css';
import FileUpload from './fileUpload.jsx';
import DataDisplay from './dataDisplay.jsx';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLoginClick = () => {
        setIsLoggedIn(!isLoggedIn); // Toggle login state
    };

    return (
        <>
            <header className="header">
                <div className="Logo">Company Logo</div>
                <button className="login-button" onClick={handleLoginClick}>
                    {isLoggedIn ? 'Logout' : 'Login'}
                </button>
            </header>

            <main className="main-content">
                <div className="component-wrapper">
                    {!isLoggedIn ? (
                        <div className="file-upload">
                            <FileUpload />
                        </div>
                    ) : (
                        <div className="data-display">
                            <DataDisplay />
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
);