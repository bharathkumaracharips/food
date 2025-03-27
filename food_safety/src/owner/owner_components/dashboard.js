import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Table, message, Row, Col } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

const { Title } = Typography;

const OwnerDashboard = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mealCounts, setMealCounts] = useState({
        breakfast: 0,
        lunch: 0,
        dinner: 0
    });

    const fetchStudentMealStatus = async () => {
        try {
            const hostelData = JSON.parse(localStorage.getItem('hostelData'));
            if (!hostelData?._id) {
                message.error('Hostel ID not found');
                return;
            }

            const response = await fetch(`http://localhost:5001/hostel/students/${hostelData._id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch students');
            }

            const data = await response.json();
            setStudents(data);

            // Calculate meal counts
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            const counts = {
                breakfast: 0,
                lunch: 0,
                dinner: 0
            };

            data.forEach(student => {
                const todayHistory = student.mealHistory?.find(h => h.date === today);
                if (todayHistory) {
                    if (todayHistory.meals.find(m => m.type === 'Breakfast')?.status) counts.breakfast++;
                    if (todayHistory.meals.find(m => m.type === 'Lunch')?.status) counts.lunch++;
                    if (todayHistory.meals.find(m => m.type === 'Dinner')?.status) counts.dinner++;
                }
            });

            setMealCounts(counts);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching students:', error);
            message.error('Failed to fetch student data');
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchStudentMealStatus();
        
        // Set up polling for real-time updates
        const interval = setInterval(fetchStudentMealStatus, 30000); // Poll every 30 seconds
        
        return () => clearInterval(interval);
    }, []);

    const columns = [
        {
            title: 'Room No',
            dataIndex: 'roomNo',
            key: 'roomNo',
            sorter: (a, b) => a.roomNo.localeCompare(b.roomNo)
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name)
        },
        {
            title: 'Breakfast',
            key: 'breakfast',
            render: (_, record) => {
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                const todayHistory = record.mealHistory?.find(h => h.date === today);
                const status = todayHistory?.meals.find(m => m.type === 'Breakfast')?.status;
                return <span className={status ? 'opted-in' : 'opted-out'}>
                    {status ? 'Opted In' : 'Opted Out'}
                </span>;
            }
        },
        {
            title: 'Lunch',
            key: 'lunch',
            render: (_, record) => {
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                const todayHistory = record.mealHistory?.find(h => h.date === today);
                const status = todayHistory?.meals.find(m => m.type === 'Lunch')?.status;
                return <span className={status ? 'opted-in' : 'opted-out'}>
                    {status ? 'Opted In' : 'Opted Out'}
                </span>;
            }
        },
        {
            title: 'Dinner',
            key: 'dinner',
            render: (_, record) => {
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                const todayHistory = record.mealHistory?.find(h => h.date === today);
                const status = todayHistory?.meals.find(m => m.type === 'Dinner')?.status;
                return <span className={status ? 'opted-in' : 'opted-out'}>
                    {status ? 'Opted In' : 'Opted Out'}
                </span>;
            }
        }
    ];

    const handleLogout = () => {
        localStorage.removeItem('hostelData');
        navigate('/owner/login');
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <Title level={2}>Hostel Dashboard</Title>
                <Button 
                    type="primary" 
                    danger 
                    icon={<LogoutOutlined />} 
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </div>

            <Card title="Today's Meal Count" className="meal-count-card">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <Card className="count-card">
                            <Title level={4}>Breakfast</Title>
                            <p>{mealCounts.breakfast} students</p>
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card className="count-card">
                            <Title level={4}>Lunch</Title>
                            <p>{mealCounts.lunch} students</p>
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card className="count-card">
                            <Title level={4}>Dinner</Title>
                            <p>{mealCounts.dinner} students</p>
                        </Card>
                    </Col>
                </Row>
            </Card>

            <Card title="Student Food Table" className="student-table-card">
                <Table 
                    dataSource={students} 
                    columns={columns} 
                    rowKey="_id"
                    loading={loading}
                />
            </Card>
        </div>
    );
};

export default OwnerDashboard; 