import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect to appropriate login page based on the first allowed role
    const loginPath = allowedRoles[0] === 'student' ? '/user/login' :
                     allowedRoles[0] === 'owner' ? '/owner/login' : '/';
    return <Navigate to={loginPath} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to home if user's role is not allowed
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 