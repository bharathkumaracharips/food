import React from "react";
import register from "./admin_componets/register_hostel";

export default function homeforadmin(){
    return(
        <div className="home">
            <h1>Food Safety</h1>
            <div className="register-hostel">
                <register/>
                <button>Register Hostel</button>
            </div>
            
        </div>
    );
}