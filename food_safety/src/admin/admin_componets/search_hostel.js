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
            const response = await fetch(`http://localhost:5001/api/hostel/search/${encodeURIComponent(hostelName)}`, {
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
        <div className="search-content">
            <div className="search-input-container">
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
                    className="search-button"
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
                    <div className="detail-row">
                        <span className="detail-label">Name:</span>
                        <span className="detail-value">{hostel.name}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Owner:</span>
                        <span className="detail-value">{hostel.ownerName}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Address:</span>
                        <span className="detail-value">{hostel.address}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Contact:</span>
                        <span className="detail-value">{hostel.contact}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{hostel.email}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Website:</span>
                        <span className="detail-value">{hostel.website}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchHostel;