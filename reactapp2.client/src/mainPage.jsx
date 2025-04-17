import { useState } from 'react';
import axios from 'axios';
import FileUpload from './fileUpload.jsx';
import DataDisplay from './dataDisplay.jsx';
import LoginPopup from './loginPopup.jsx';

export function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleLogin = async (username, password) => {
        setErrorMessage(null); 
        try {
            const API_URL = 'https://resumeqrcodeverificationsystem-gbezd9awfdbtgyf4.westus-01.azurewebsites.net/api/auth/login';
            const response = await axios.post(API_URL, {
                Username: username,
                Password: password
            });

            if (response.data.success) {
                //console.log(response.data.message, "User:", response.data.user) //Testing Only
                setIsLoggedIn(true);
                setShowLoginPopup(false);
            } else {
                setErrorMessage(response.data.error || "Invalid username or password");
            }
        } catch (error) {
            let message = "An error occurred during login";
            if (error.response) {
                message = error.response.data.error;
                //message = error.response.data.error || "Invalid credentials";
            } else if (error.request) {
                message = "Unable to connect to the server";
            }
            setErrorMessage(message);
        }
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            setIsLoggedIn(false);
        }
        // Logout cleanup here
    };

    const ErrorMessage = ({ message, onClose }) => (
        <div className="error-message">
            {message}
            <button onClick={onClose} className="error-close">&times;</button>
        </div>
    );

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
                    onClose={() => {
                        setShowLoginPopup(false);
                        setErrorMessage(null);
                    }}
                    onLogin={handleLogin}
                    error={errorMessage}  
                />
            )}
            {errorMessage && (
                <ErrorMessage
                    message={errorMessage}
                    onClose={() => setErrorMessage(null)}
                />
            )}

        </>
    );
}
