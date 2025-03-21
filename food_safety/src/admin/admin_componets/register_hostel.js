import React from  "react";
import { useState } from "react";   
export default function register(){
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
    return(
        <div className="register-hostel">
            <h1>Register Hostel</h1>
            <form>
                <input type="text" placeholder="Hostel Name" />
                <input type="text" placeholder="Hostel Owner Name" />
                <input type="text" placeholder="Hostel Address" />
                <input type="text" placeholder="Hostel Contact" />
                <input type="text" placeholder="Hostel Email" />
                <input type="text" placeholder="Hostel Website" />
                <input type="text" placeholder="Hostel Owner Username" />
                <input type="text" placeholder="Hostel Owner Password" />
                <input type="text" placeholder="Hostel Owner Confirm Password" />
                <button type="submit">Register</button>
            </form>
        </div>
       
    );
}