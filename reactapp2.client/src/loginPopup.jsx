import { useState } from 'react';
import './loginPopup.css';

export default function LoginPopup({ onClose, onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(username, password);
    };

    return (

        <div className="popup-overlay">
            <div className="popup-content">
                <button
                    className="close-button"
                    onClick={onClose}
                    aria-label="Close login popup">
                    &times;
                </button>
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-submit">Login</button>
                </form>
            </div>
        </div>
    );
}