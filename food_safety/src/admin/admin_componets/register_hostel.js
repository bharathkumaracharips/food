import React from  "react";
import { useState } from "react";   
import { useNavigate } from "react-router-dom";

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
          throw new Error("Passwords do not match");
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
        <div className="register-hostel">
            <h1>Register Hostel</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Hostel Name" name="name" value={hostel.name} onChange={handleChange} required />
                <input type="text" placeholder="Hostel Owner Name" name="ownerName" value={hostel.ownerName} onChange={handleChange} required />
                <input type="text" placeholder="Hostel Address" name="address" value={hostel.address} onChange={handleChange} required />
                <input type="text" placeholder="Hostel Contact" name="contact" value={hostel.contact} onChange={handleChange} required />
                <input type="email" placeholder="Hostel Email" name="email" value={hostel.email} onChange={handleChange} required />
                <input type="url" placeholder="Hostel Website" name="website" value={hostel.website} onChange={handleChange} required />
                <input type="text" placeholder="Hostel Owner Username" name="username" value={hostel.username} onChange={handleChange} required />
                <input type="password" placeholder="Hostel Owner Password" name="password" value={hostel.password} onChange={handleChange} required />
                <input type="password" placeholder="Hostel Owner Confirm Password" name="confirmPassword" value={hostel.confirmPassword} onChange={handleChange} required />
                <button type="submit">Register</button>
            </form>
        </div>
               
    );
}