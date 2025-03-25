import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, message } from "antd";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const StudentLogin = () => {
  const [hostels, setHostels] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/name"); // Ensure this endpoint is correct
        if (!response.ok) {
          throw new Error("Failed to fetch hostels");
        }
        const data = await response.json();
        setHostels(data); // Update state with fetched hostels
      } catch (error) {
        console.error("Error fetching hostels:", error);
        message.error("Failed to load hostels");
      }
    };

    fetchHostels();
  }, []);

  const handleLogin = async (values) => {
    try {
      const response = await fetch("http://localhost:5001/api/students/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (response.ok) {
        message.success("Login successful");
        localStorage.setItem("studentData", JSON.stringify(data));
        navigate("/user/home");
      } else {
        message.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
      message.error("Login failed");
    }
  };

  return (
    <div className="student-login">
      <h2>Student Login</h2>
      <Form layout="vertical" onFinish={handleLogin}>
        <Form.Item
          label="Hostel Name"
          name="hostelId"
          rules={[{ required: true, message: "Please select your hostel" }]}
        >
          <Select placeholder="Select your hostel">
            {hostels.length > 0 ? (
              hostels.map((hostel) => (
                <Option key={hostel._id} value={hostel._id}>
                  {hostel.name} {/* Use the correct field 'name' */}
                </Option>
              ))
            ) : (
              <Option disabled>Loading hostels...</Option>
            )}
          </Select>
        </Form.Item>
        <Form.Item
          label="Room Number"
          name="roomNo"
          rules={[{ required: true, message: "Please enter your room number" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: "Please enter your username" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please enter your password" }]}
        >
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Login
        </Button>
      </Form>
    </div>
  );
};

export default StudentLogin;
