import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Table, message, Modal } from 'antd';
import RegisterStudent from './owner_components/register_student';
import StudentFoodTable from './owner_components/tabel_for_food'; // Import the food table component
import './home.css';

const OwnerHome = () => {
    const navigate = useNavigate();
    const hostelData = JSON.parse(localStorage.getItem('hostelData'));
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn || !hostelData) {
            navigate('/owner/login');
        } else {
            fetchStudents();
        }
    }, [navigate]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5001/api/students/${hostelData.id}`);
            const data = await response.json();
            if (response.ok) {
                setStudents(data);
            } else {
                message.error('Failed to fetch students');
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            message.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveStudent = async (studentId) => {
        try {
            const response = await fetch(`http://localhost:5001/api/students/${studentId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                message.success('Student removed successfully');
                fetchStudents(); // Refresh the list
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
                <Button 
                    type="link" 
                    danger 
                    onClick={() => handleRemoveStudent(record._id)}
                >
                    Remove
                </Button>
            ),
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

                <Card title="Registered Students" className="students-card">
                    <Table 
                        dataSource={students} 
                        columns={columns}  
                        loading={loading}
                        rowKey="_id"
                        pagination={{ pageSize: 10 }}
                    />
                </Card>

                {/* Add the StudentFoodTable component */}
                <Card title="Student Food Table" className="food-table-card">
                    <StudentFoodTable />
                </Card>
            </div>

            <Modal
                title="Register New Student"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={600}
            >
                <RegisterStudent
                    hostelId={hostelData.id}
                    onSuccess={() => {
                        setIsModalVisible(false);
                        fetchStudents();
                    }}
                />
            </Modal>
        </div>
    );
};

export default OwnerHome;