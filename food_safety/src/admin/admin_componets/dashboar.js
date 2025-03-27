import React from 'react';
import './dashboard.css';
import Register from "./register_hostel";       
import SearchHostel from "./search_hostel";

const Dashboard = () => {
    return (
        <div className="dashboard">
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
};

export default Dashboard;
