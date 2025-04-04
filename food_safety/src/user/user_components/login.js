import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, message, Card } from "antd";
import { useNavigate } from "react-router-dom";
import './login.css';

const { Option } = Select;

const StudentLogin = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/hostel/all");
        if (!response.ok) {
          throw new Error("Failed to fetch hostels");
        }
        const data = await response.json();
        setHostels(data);
      } catch (error) {
        console.error("Error fetching hostels:", error);
        message.error("Failed to load hostels");
      } finally {
        setLoading(false);
      }
    };

    fetchHostels();
  }, []);

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      console.log('Login values being sent:', values);
      const response = await fetch("http://localhost:5001/api/student/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store student data in localStorage
      localStorage.setItem("studentData", JSON.stringify(data));
      message.success("Login successful");
      
      // Navigate to dashboard
      navigate("/user/home");
    } catch (error) {
      console.error("Error during login:", error);
      message.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-login-container">
      <Card title="Student Login" className="login-card">
        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            label="Hostel"
            name="hostelId"
            rules={[{ required: true, message: "Please select your hostel" }]}
          >
            <Select 
              placeholder="Select your hostel"
              loading={loading}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {hostels.map((hostel) => (
                <Option key={hostel._id} value={hostel._id}>
                  {hostel.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Room Number"
            name="roomNo"
            rules={[{ required: true, message: "Please enter your room number" }]}
          >
            <Input placeholder="Enter your room number" />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter your username" }]}
          >
            <Input placeholder="Enter your username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default StudentLogin;
