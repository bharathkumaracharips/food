import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const SearchHostel = () => {
    const [hostelName, setHostelName] = useState('');
    const [hostel, setHostel] = useState(null);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        
        try {
            const response = await fetch(`http://localhost:5000/hostels/${hostelName}`);
            const data = await response.json();
            setHostel(data);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="search-hostel">
            
            <input
                type="text"
                value={hostelName}
                onChange={(e) => setHostelName(e.target.value)}
                placeholder="Enter hostel name"
            />
            <button onClick={handleSearch}>Search</button>
            {error && <p className="error">{error}</p>}
            {hostel && (
                <div className="hostel-details">
                    <h2>{hostel.name}</h2>
                    <p>Address: {hostel.address}</p>
                    <p>Contact: {hostel.contact}</p>
                    <p>Email: {hostel.email}</p>
                    <p>Website: {hostel.website}</p>
                </div>
            )}
        </div>
    );
};

export default SearchHostel;