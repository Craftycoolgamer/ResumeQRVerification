import { useState } from 'react';
import FileUpload from './fileUpload.jsx';
import DataDisplay from './dataDisplay.jsx';
import LoginPopup from './loginPopup.jsx';

export function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [showLoginPopup, setShowLoginPopup] = useState(false);

    const handleLogin = (username, password) => {
        // Add actual authentication logic here
        console.log("Login attempt with: Username:", username, "Password:", password);
        setIsLoggedIn(true);
        setShowLoginPopup(false);
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            setIsLoggedIn(false);
        }
        // Add any additional logout cleanup here
    };

    return (
        <>
            <header className="header">
                <div className="Logo">Company Logo</div>
                <button className="login-button" onClick={() => {
                    if (isLoggedIn) {
                        handleLogout();
                    } else {
                        setShowLoginPopup(true);
                    }
                }}>
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

            {showLoginPopup && (
                <LoginPopup
                    onClose={() => setShowLoginPopup(false)}
                    onLogin={handleLogin} />
            )}
        </>
    );
}
