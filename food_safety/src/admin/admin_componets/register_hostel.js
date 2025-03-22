import React from  "react";
import { useState } from "react";   
import { useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();

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

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(hostel);
        navigate("/admin/hostel");
    };
    return(
        <div className="register-hostel">
            <h1>Register Hostel</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Hostel Name" name="name" value={hostel.name} onChange={handleChange} />
                <input type="text" placeholder="Hostel Owner Name" name="ownerName" value={hostel.ownerName} onChange={handleChange} />
                <input type="text" placeholder="Hostel Address" name="address" value={hostel.address} onChange={handleChange} />
                <input type="text" placeholder="Hostel Contact" name="contact" value={hostel.contact} onChange={handleChange} />
                <input type="text" placeholder="Hostel Email" name="email" value={hostel.email} onChange={handleChange} />
                <input type="text" placeholder="Hostel Website" name="website" value={hostel.website} onChange={handleChange} />
                <input type="text" placeholder="Hostel Owner Username" name="username" value={hostel.username} onChange={handleChange} />
                <input type="text" placeholder="Hostel Owner Password" name="password" value={hostel.password} onChange={handleChange} />
                <input type="text" placeholder="Hostel Owner Confirm Password" name="confirmPassword" value={hostel.confirmPassword} onChange={handleChange} />
                <button type="submit">Register</button>
            </form>
        </div>
               
    );
}