import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Table, message, Modal, Input, Form, Tabs } from 'antd';
import RegisterStudent from './owner_components/register_student';
import StudentFoodTable from './owner_components/tabel_for_food';
import MealMonitoring from './owner_components/meal_monitoring';
import './home.css';

const OwnerHome = () => {
    const navigate = useNavigate();
    const [hostelData, setHostelData] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [form] = Form.useForm();

    const fetchStudents = async (hostelId) => {
        if (!hostelId) {
            console.error('No hostel ID provided');
            return;
        }
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5001/hostel/get-all-students/${hostelId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch students');
            }
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
            message.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const storedHostelData = localStorage.getItem('hostelData');
        
        if (!isLoggedIn || !storedHostelData) {
            navigate('/owner/login');
            return;
        }

        try {
            const parsedHostelData = JSON.parse(storedHostelData);
            if (!parsedHostelData || !parsedHostelData.id) {
                message.error('Invalid hostel data. Please login again.');
                handleLogout();
                return;
            }
            setHostelData(parsedHostelData);
            fetchStudents(parsedHostelData.id);
        } catch (error) {
            console.error('Error loading hostel data:', error);
            message.error('Error loading hostel data. Please login again.');
            handleLogout();
        }
    }, [navigate]); // Only re-run if navigate changes

    const handleRemoveStudent = async (studentId) => {
        try {
            const response = await fetch(`http://localhost:5001/student/${studentId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                message.success('Student removed successfully');
                // Use hostelData from state
                hostelData && fetchStudents(hostelData.id);
            } else {
                message.error('Failed to remove student');
            }
        } catch (error) {
            console.error('Error removing student:', error);
            message.error('Failed to remove student');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('hostelData');
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    const handleResetPassword = async (values) => {
        try {
            const response = await fetch('http://localhost:5001/student/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentId: selectedStudent._id,
                    newPassword: values.newPassword
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to reset password');
            }

            message.success('Password reset successfully');
            setIsResetModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error('Error resetting password:', error);
            message.error(error.message || 'Failed to reset password');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Room No',
            dataIndex: 'roomNo',
            key: 'roomNo',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div>
                    <Button 
                        type="link" 
                        onClick={() => {
                            setSelectedStudent(record);
                            setIsResetModalVisible(true);
                        }}
                        style={{ marginRight: '8px' }}
                    >
                        Reset Password
                    </Button>
                    <Button 
                        type="link" 
                        danger 
                        onClick={() => handleRemoveStudent(record._id)}
                    >
                        Remove
                    </Button>
                </div>
            ),
        },
    ];

    const tabItems = [
        {
            key: '1',
            label: 'Students',
            children: (
                <Card title="Registered Students" className="students-card">
                    <Table 
                        dataSource={students} 
                        columns={columns}  
                        loading={loading}
                        rowKey="_id"
                        pagination={{ pageSize: 10 }}
                    />
                </Card>
            ),
        },
        {
            key: '2',
            label: "Today's Meals",
            children: (
                <Card title="Student Food Table" className="food-table-card">
                    <StudentFoodTable />
                </Card>
            ),
        },
        {
            key: '3',
            label: 'Meal History',
            children: <MealMonitoring hostelId={hostelData?.id} />,
        },
    ];

    if (!hostelData) {
        return null;
    }

    return (
        <div className="owner-home">
            <header className="owner-header">
                <h1>Welcome, {hostelData.name}</h1>
                <Button onClick={handleLogout} type="primary" danger>
                    Logout
                </Button>
            </header>

            <div className="owner-dashboard">
                <Card 
                    title="Hostel Information" 
                    className="info-card"
                    extra={
                        <Button type="primary" onClick={() => setIsModalVisible(true)}>
                            Register New Student
                        </Button>
                    }
                >
                    <div className="hostel-info">
                        <p><strong>Owner Name:</strong> {hostelData.ownerName}</p>
                        <p><strong>Email:</strong> {hostelData.email}</p>
                    </div>
                </Card>

                <Tabs defaultActiveKey="1" items={tabItems} />
            </div>

            <Modal
                title="Register New Student"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <RegisterStudent 
                    hostelId={hostelData.id} 
                    onSuccess={() => {
                        setIsModalVisible(false);
                        hostelData && fetchStudents(hostelData.id);
                    }}
                />
            </Modal>

            <Modal
                title="Reset Password"
                open={isResetModalVisible}
                onCancel={() => setIsResetModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleResetPassword}>
                    <Form.Item
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Please enter new password' },
                            { min: 6, message: 'Password must be at least 6 characters' }
                        ]}
                    >
                        <Input.Password placeholder="Enter new password" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Reset Password
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default OwnerHome;