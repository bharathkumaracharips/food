import React from "react";
import Register from "./admin_componets/register_hostel";       
import SearchHostel from "./admin_componets/search_hostel";
import { useNavigate } from "react-router-dom";
import "./home.css";

export default function HomeForAdmin() {
    const navigate = useNavigate();
    return(
        <div className="home">
            <h1>Food Safety</h1>
            <div className="register-hostel">
                <Register />
               
            </div>
            <div className="search-hostel">
                <h1>Search Hostel</h1>
                <SearchHostel />
                
            </div>
        </div>
    );
}