import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, message } from "antd";
import StudentLogin from "./user_components/login";

const StudentHome = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("studentData"));
    if (!data) {
      setStudentData(null); // Ensure studentData is null if not logged in
    } else {
      setStudentData(data);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("studentData");
    message.success("Logged out successfully");
    setStudentData(null); // Reset studentData on logout
  };

  if (!studentData) {
    return (
      <div className="student-login-container">
        <StudentLogin />
      </div>
    );
  }

  return (
    <div className="student-home">
      <header className="student-header">
        <h1>Welcome, {studentData.name}</h1>
        <Button onClick={handleLogout} type="primary" danger>
          Logout
        </Button>
      </header>

      <div className="student-dashboard">
        <Card title="Student Information" className="info-card">
          <p><strong>Hostel Name:</strong> {studentData.hostelName}</p>
          <p><strong>Room Number:</strong> {studentData.roomNo}</p>
          <p><strong>Username:</strong> {studentData.username}</p>
          <p><strong>Email:</strong> {studentData.email}</p>
        </Card>
      </div>
    </div>
  );
};

export default StudentHome;
