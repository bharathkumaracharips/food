import React, { useState } from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom';
//username root
//password root
const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            
            // Check credentials
            if (username === 'root' && password === 'root') {
                // Store admin authentication state
                localStorage.setItem('adminAuth', 'true');
                // Navigate to admin dashboard
                navigate('/admin/dashboard');
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };  

    return (
        <div className="login-container">
            <h2>Admin Login</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    )
};

export default Login;