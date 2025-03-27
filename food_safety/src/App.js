import React from 'react';
import './App.css';
import HomeForAdmin from "./admin/home.js"; // Add .js extension
import { BrowserRouter as Router, Route, Routes, useNavigate, Link } from "react-router-dom";
import Register from "./admin/admin_componets/register_hostel.js"; // Ensure this matches your folder name
import OwnerLogin from "./owner/owner_components/login.js";
import OwnerHome from "./owner/home.js";
import StudentLogin from "./user/user_components/login.js"; // Import StudentLogin
import StudentDashboard from "./user/user_components/dashboard.js";
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function Header() {
  const { user, logout } = useAuth();
  
  return (
    <header className="header">
      <Link to="/" className="header-logo">
        🍽️ ServeSmart
      </Link>
      <nav className="header-nav">
        {!user ? (
          <>
            <Link to="/owner/login">Owner</Link>
            <Link to="/user/login">User</Link>
          </>
        ) : (
          <>
            <span>Welcome, {user.username}</span>
            <button onClick={logout} className="logout-button">Logout</button>
          </>
        )}
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">🍽️ ServeSmart</div>
        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}

function MainPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is already logged in, redirect to their dashboard
  React.useEffect(() => {
    if (user) {
      const dashboardPath = user.role === 'student' ? '/user/home' :
                           user.role === 'owner' ? '/owner/home' : '/admin';
      navigate(dashboardPath);
    }
  }, [user, navigate]);

  return (
    <div className="main-selection">
      <div className="section">
        <h1>Welcome to <span className="highlight">ServeSmart</span></h1>
        <p className="tagline mt-2">Join us in reducing food waste where <span className="highlight"> Every Meal Counts</span></p>
      </div>
      <div className="section selection-buttons">
        <button onClick={() => navigate("/owner/login")} className="selection-button">
          Login as Owner
        </button>
        <button onClick={() => navigate("/user/login")} className="selection-button">
          Login as User
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Router>
          <Header />
          <main style={{ marginTop: 'var(--header-height)', minHeight: 'calc(100vh - var(--header-height) - var(--footer-height))' }}>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <HomeForAdmin />
                </ProtectedRoute>
              } />
              <Route path="/admin/hostel" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Register />
                </ProtectedRoute>
              } />
              <Route path="/owner/login" element={<OwnerLogin />} />
              <Route path="/owner/home" element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <OwnerHome />
                </ProtectedRoute>
              } />
              <Route path="/user/login" element={<StudentLogin />} />
              <Route path="/user/home" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
