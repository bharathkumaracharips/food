import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import './register_student.css';

const RegisterStudent = ({ hostelId, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        console.log(values);
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5001/api/student/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    hostelId
                })
            });

            const data = await response.json();

            if (response.ok) {
                message.success('Student registered successfully');
                onSuccess();
            } else {
                throw new Error(data.error || 'Failed to register student');
            }
        } catch (error) {
            console.error('Registration error:', error);
            message.error(error.message || 'Failed to register student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            name="registerStudent"
            onFinish={handleSubmit}
            layout="vertical"
            requiredMark={false}
        >
            <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: 'Please enter student name' }]}
            >
                <Input placeholder="Enter student name" />
            </Form.Item>

            <Form.Item
                label="Email"
                name="email"
                rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter a valid email' }
                ]}
            >
                <Input placeholder="Enter email address" />
            </Form.Item>

            <Form.Item
                label="Phone"
                name="phone"
                rules={[
                    { required: true, message: 'Please enter phone number' },
                    { pattern: /^\d{10}$/, message: 'Please enter a valid 10-digit phone number' }
                ]}
            >
                <Input placeholder="Enter phone number" />
            </Form.Item>

            <Form.Item
                label="Room Number"
                name="roomNo"
                rules={[{ required: true, message: 'Please enter room number' }]}
            >
                <Input placeholder="Enter room number" />
            </Form.Item>

            <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please enter username' }]}
            >
                <Input placeholder="Enter username" />
            </Form.Item>

            <Form.Item
                label="Password"
                name="password"
                rules={[
                    { required: true, message: 'Please enter password' },
                    { min: 6, message: 'Password must be at least 6 characters' }
                ]}
            >
                <Input.Password placeholder="Enter password" />
            </Form.Item>

            <Form.Item className="form-actions">
                <Button type="primary" htmlType="submit" loading={loading} block>
                    Register Student
                </Button>
            </Form.Item>
        </Form>
    );
};

export default RegisterStudent;