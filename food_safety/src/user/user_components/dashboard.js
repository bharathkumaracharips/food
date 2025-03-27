import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Row, Col, message, Calendar, Tabs, Tag } from 'antd';
import { LogoutOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import StudentMenuView from './student_menu_view';
import './dashboard.css';

const { Title } = Typography;

const Dashboard = () => {
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState(null);
    const [mealStatus, setMealStatus] = useState({
        breakfast: false,
        lunch: false,
        dinner: false
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [hostelDetails, setHostelDetails] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [mealHistory, setMealHistory] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [loading, setLoading] = useState(true);

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = localStorage.getItem('studentData');
                if (!data) {
                    message.error('Please login to access the dashboard');
                    navigate('/user/login');
                    return;
                }

                const parsedData = JSON.parse(data);
                if (!parsedData || !parsedData.student || !parsedData.student._id) {
                    message.error('Invalid student data');
                    navigate('/user/login');
                    return;
                }

                setStudentData(parsedData.student);

                // Fetch hostel details
                if (parsedData.student.hostelId) {
                    const hostelResponse = await fetch(`http://localhost:5001/api/hostel/all`);
                    if (!hostelResponse.ok) {
                        throw new Error('Failed to fetch hostel details');
                    }
                    const hostels = await hostelResponse.json();
                    const hostelData = hostels.find(h => h._id === parsedData.student.hostelId);
                    if (hostelData) {
                        setHostelDetails(hostelData);
                    }
                }

                // Fetch meal history and set current status
                if (parsedData.student._id) {
                    const historyResponse = await fetch(`http://localhost:5001/api/student/meal-history/${parsedData.student._id}`);
                    if (!historyResponse.ok) {
                        throw new Error('Failed to fetch meal history');
                    }
                    const historyData = await historyResponse.json();
                    setMealHistory(historyData);
                    
                    // Set current meal status based on today's date
                    const today = new Date().toISOString().split('T')[0];
                    const todayHistory = historyData.find(h => {
                        const historyDate = new Date(h.date).toISOString().split('T')[0];
                        return historyDate === today;
                    });

                    if (todayHistory) {
                        const currentStatus = {
                            breakfast: todayHistory.meals.find(m => m.type === 'Breakfast')?.status || false,
                            lunch: todayHistory.meals.find(m => m.type === 'Lunch')?.status || false,
                            dinner: todayHistory.meals.find(m => m.type === 'Dinner')?.status || false
                        };
                        setMealStatus(currentStatus);
                        setIsSubmitted(todayHistory.isSubmitted || false);
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
                message.error('Failed to load student data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);
    
    const handleLogout = () => {
        localStorage.removeItem('studentData');
        navigate('/user/login');
    };

    const cellRender = (value) => {
        // Convert the calendar date to the same format as the meal history date
        const date = value.format('YYYY-MM-DD');
        const dayHistory = mealHistory.find(h => {
            const historyDate = new Date(h.date).toISOString().split('T')[0];
            return historyDate === date;
        });
        
        if (dayHistory) {
            return (
                <ul className="meal-history-list">
                    {dayHistory.meals.map((meal, index) => (
                        <li 
                            key={index} 
                            className={`${meal.status ? 'opted-in' : 'opted-out'} meal-item`}
                        >
                            {meal.type}
                        </li>
                    ))}
                </ul>
            );
        }
        return null;
    };

    const items = [
        {
            key: '1',
            label: 'Meal Status',
            children: (
                <div>
                    <Card className="time-card">
                        <ClockCircleOutlined style={{ fontSize: '24px', marginRight: '8px' }} />
                        Current Time: {currentTime.toLocaleTimeString()}
                    </Card>
                    
                    <Card className="meal-status-card">
                        <Title level={3}>Today's Meal Status</Title>
                        <Row gutter={[16, 16]}>
                            <Col span={8}>
                                <Card>
                                    <Title level={4}>Breakfast</Title>
                                    <div className="meal-status-display">
                                        {mealStatus.breakfast ? (
                                            <Tag icon={<CheckCircleOutlined />} color="success">
                                                Opted In
                                            </Tag>
                                        ) : (
                                            <Tag icon={<CloseCircleOutlined />} color="error">
                                                Opted Out
                                            </Tag>
                                        )}
                                    </div>
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card>
                                    <Title level={4}>Lunch</Title>
                                    <div className="meal-status-display">
                                        {mealStatus.lunch ? (
                                            <Tag icon={<CheckCircleOutlined />} color="success">
                                                Opted In
                                            </Tag>
                                        ) : (
                                            <Tag icon={<CloseCircleOutlined />} color="error">
                                                Opted Out
                                            </Tag>
                                        )}
                                    </div>
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card>
                                    <Title level={4}>Dinner</Title>
                                    <div className="meal-status-display">
                                        {mealStatus.dinner ? (
                                            <Tag icon={<CheckCircleOutlined />} color="success">
                                                Opted In
                                            </Tag>
                                        ) : (
                                            <Tag icon={<CloseCircleOutlined />} color="error">
                                                Opted Out
                                            </Tag>
                                        )}
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                        {isSubmitted && (
                            <div style={{ marginTop: '16px', textAlign: 'center' }}>
                                <Tag color="blue" style={{ padding: '4px 8px' }}>
                                    Meal preferences have been submitted for today
                                </Tag>
                            </div>
                        )}
                    </Card>
                    
                    <Card title="Meal History" className="meal-history-card">
                        <Calendar cellRender={cellRender} value={selectedDate} onChange={setSelectedDate} />
                    </Card>
                </div>
            ),
        },
        {
            key: '2',
            label: 'Weekly Menu',
            children: <StudentMenuView />,
        },
    ];

    if (loading) {
        return <div className="dashboard-container">Loading...</div>;
    }

    if (!studentData) {
        return <div className="dashboard-container">No student data found</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <Title level={2}>Student Dashboard</Title>
                <Button 
                    type="primary" 
                    icon={<LogoutOutlined />} 
                    onClick={handleLogout}
                    danger
                >
                    Logout
                </Button>
            </div>

            {studentData && (
                <Card className="student-info-card">
                    <Title level={4}>Welcome, {studentData.name}</Title>
                    
                    {hostelDetails && <p>Hostel: {hostelDetails.name}</p>}
                </Card>
            )}

            <Tabs defaultActiveKey="1" items={items} />
        </div>
    );
};

export default Dashboard;
        
