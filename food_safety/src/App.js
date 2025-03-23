import React from 'react';
import './App.css';
import HomeForAdmin from "./admin/home.js"; // Add .js extension
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import Register from "./admin/admin_componets/register_hostel.js"; // Ensure this matches your folder name
import OwnerLogin from "./owner/owner_components/login.js";
import OwnerHome from "./owner/home.js";

function MainPage() {
  const navigate = useNavigate();
  return (
    <div className="main-selection">
      <h1>Welcome to Food Safety</h1>
      <div className="selection-buttons">
        <button onClick={() => navigate("/admin")} className="selection-button">
          Login as Admin
        </button>
        <button onClick={() => navigate("/owner/login")} className="selection-button">
          Login as Owner
        </button>
        <button onClick={() => navigate("/register")} className="selection-button">
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
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/admin" element={<HomeForAdmin />} />
          <Route path="/admin/hostel" element={<Register />} />
          <Route path="/owner/login" element={<OwnerLogin />} />
          <Route path="/owner/home" element={<OwnerHome />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
