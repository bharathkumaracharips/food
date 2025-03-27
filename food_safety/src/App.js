import React from 'react';
import './App.css';
import HomeForAdmin from "./admin/home.js"; // Add .js extension
import { BrowserRouter as Router, Route, Routes, useNavigate, Link } from "react-router-dom";
import Register from "./admin/admin_componets/register_hostel.js"; // Ensure this matches your folder name
import OwnerLogin from "./owner/owner_components/login.js";
import OwnerHome from "./owner/home.js";
import StudentLogin from "./user/user_components/login.js"; // Import StudentLogin
import StudentDashboard from "./user/user_components/dashboard.js";
import AdminLogin from "./admin/admin_componets/login.js";
import AdminDashboard from "./admin/admin_componets/dashboar.js";
import ProtectedRoute from "./admin/admin_componets/ProtectedRoute.js";

function Header() {
  return (
    <header className="header">
      <Link to="/" className="header-logo">
        🍽️ ServeSmart
      </Link>
      <nav className="header-nav">
        <Link to="/admin">Admin</Link>
        <Link to="/owner/login">Owner</Link>
        <Link to="/user/login">User</Link>
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
  return (
    <div className="main-selection">
      <div className="section">
        <h1>Welcome to <span className="highlight">ServeSmart</span></h1>
        <p className="tagline mt-2">Join us in reducing food waste where <span className="highlight"> Every Meal Counts</span></p>
      </div>
      <div className="section selection-buttons">
        <button onClick={() => navigate("/admin")} className="selection-button">
          Login as Admin
        </button>
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
    <div className="App">
      <Router>
        <Header />
        <main style={{ marginTop: 'var(--header-height)', minHeight: 'calc(100vh - var(--header-height) - var(--footer-height))' }}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/admin" element={<HomeForAdmin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/hostel" 
              element={
                <ProtectedRoute>
                  <Register />
                </ProtectedRoute>
              } 
            />
            <Route path="/owner/login" element={<OwnerLogin />} />
            <Route path="/owner/home" element={<OwnerHome />} />
            <Route path="/user/login" element={<StudentLogin />} />
            <Route path="/user/home" element={<StudentDashboard />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
