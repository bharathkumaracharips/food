import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = () => {
      const studentData = localStorage.getItem('studentData');
      const ownerData = localStorage.getItem('ownerData');
      const adminData = localStorage.getItem('adminData');

      if (studentData) {
        setUser({ ...JSON.parse(studentData), role: 'student' });
      } else if (ownerData) {
        setUser({ ...JSON.parse(ownerData), role: 'owner' });
      } else if (adminData) {
        setUser({ ...JSON.parse(adminData), role: 'admin' });
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData, role) => {
    localStorage.setItem(`${role}Data`, JSON.stringify(userData));
    setUser({ ...userData, role });
  };

  const logout = () => {
    localStorage.removeItem('studentData');
    localStorage.removeItem('ownerData');
    localStorage.removeItem('adminData');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 