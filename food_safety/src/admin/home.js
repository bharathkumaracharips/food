import React from "react";
import Register from "./admin_componets/register_hostel";       
import SearchHostel from "./admin_componets/search_hostel";
import { useNavigate } from "react-router-dom";
import "./home.css";

export default function HomeForAdmin() {
    const navigate = useNavigate();
    return(
        <div className="home">
            <h1>Admin Dashboard</h1>
            <div className="home-container">
                <div className="register-hostel">
                    <h2>Register Hostel</h2>
                    <Register />
                </div>
                <div className="search-hostel">
                    <h2>Search Hostel</h2>
                    <SearchHostel />
                </div>
            </div>
        </div>
    );
}