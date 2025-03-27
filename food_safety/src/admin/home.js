import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';

const HomeForAdmin = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to admin login page
        navigate('/admin/login');
    }, [navigate]);

    return null;
};

export default HomeForAdmin;