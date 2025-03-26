import React from "react";
import { useState } from "react";   
import { useNavigate } from "react-router-dom";
import './register_hostel.css';

export default function Register() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const [hostel, setHostel] = useState({
        name: "",
        ownerName: "",
        address: "",
        contact: "",
        email: "",
        website: "",
        username: "",
        password: "",
        confirmPassword: "",
    });
    
    const handleChange = (e) => {
        setHostel({ ...hostel, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (hostel.password !== hostel.confirmPassword) {
            setError("Passwords do not match");
            return;
        }   
        try {
            const response = await fetch("http://localhost:5001/hostel/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(hostel),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Registration failed");
            }

            alert("Hostel registered successfully!");
            navigate("/admin/hostel");
        } catch (error) {
            setError(error.message);
        }
    };

    return(
        <div className="register-content">
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                    <input 
                        type="text" 
                        placeholder="Hostel Name" 
                        name="name" 
                        value={hostel.name} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <input 
                        type="text" 
                        placeholder="Hostel Owner Name" 
                        name="ownerName" 
                        value={hostel.ownerName} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <input 
                        type="text" 
                        placeholder="Hostel Address" 
                        name="address" 
                        value={hostel.address} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <input 
                        type="text" 
                        placeholder="Hostel Contact" 
                        name="contact" 
                        value={hostel.contact} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <input 
                        type="email" 
                        placeholder="Hostel Email" 
                        name="email" 
                        value={hostel.email} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <input 
                        type="url" 
                        placeholder="Hostel Website" 
                        name="website" 
                        value={hostel.website} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <input 
                        type="text" 
                        placeholder="Hostel Owner Username" 
                        name="username" 
                        value={hostel.username} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <input 
                        type="password" 
                        placeholder="Hostel Owner Password" 
                        name="password" 
                        value={hostel.password} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <input 
                        type="password" 
                        placeholder="Confirm Password" 
                        name="confirmPassword" 
                        value={hostel.confirmPassword} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <button type="submit" className="register-button">Register</button>
            </form>
        </div>
    );
}