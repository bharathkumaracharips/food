import React, { useState } from 'react';
import './search_hostel.css';

const SearchHostel = () => {
    const [hostelName, setHostelName] = useState('');
    const [hostel, setHostel] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!hostelName.trim()) {
            setError('Please enter a hostel name');
            return;
        }

        setLoading(true);
        setError(null);
        setHostel(null);
        
        try {
            const response = await fetch(`http://localhost:5001/hostels/${encodeURIComponent(hostelName)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch hostel data');
            }

            if (!data) {
                setError('No hostel found with that name');
                return;
            }

            setHostel(data);
        } catch (error) {
            setError(error.message || 'An error occurred while searching');
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="search-hostel">
            <div className="search-container">
                <input
                    type="text"
                    value={hostelName}
                    onChange={(e) => setHostelName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter hostel name"
                    disabled={loading}
                />
                <button 
                    onClick={handleSearch} 
                    disabled={loading}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {hostel && (
                <div className="hostel-details">
                    <h2>{hostel.name}</h2>
                    <p><strong>Owner:</strong> {hostel.ownerName}</p>
                    <p><strong>Address:</strong> {hostel.address}</p>
                    <p><strong>Contact:</strong> {hostel.contact}</p>
                    <p><strong>Email:</strong> {hostel.email}</p>
                    <p><strong>Website:</strong> {hostel.website}</p>
                </div>
            )}
        </div>
    );
};

export default SearchHostel;