import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Row, Col, Switch, message, Calendar, Tabs } from 'antd';
import { LogoutOutlined, ClockCircleOutlined } from '@ant-design/icons';
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

    const handleSubmit = async () => {
        if (!studentData?._id) {
            message.error('Student ID not found');
            return;
        }

        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await fetch(`http://localhost:5001/api/student/submit-meals/${studentData._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: today,
                    meals: {
                        breakfast: mealStatus.breakfast,
                        lunch: mealStatus.lunch,
                        dinner: mealStatus.dinner
                    }
                }),
            });

            if (response.ok) {
                setIsSubmitted(true);
                message.success('Meal preferences submitted successfully');
                
                // Update meal history
                const historyResponse = await fetch(`http://localhost:5001/api/student/meal-history/${studentData._id}`);
                if (historyResponse.ok) {
                    const historyData = await historyResponse.json();
                    setMealHistory(historyData);
                }
            } else {
                throw new Error('Failed to submit meal preferences');
            }
        } catch (error) {
            console.error('Error submitting meal preferences:', error);
            message.error('Failed to submit meal preferences');
        }
    };

    const handleMealToggle = async (meal) => {
        if (!studentData?._id) {
            message.error('Student ID not found');
            return;
        }

        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await fetch(`http://localhost:5001/api/student/meal-status/${studentData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    meal,
                    status: !mealStatus[meal],
                    date: today
                }),
            });

            if (response.ok) {
                setMealStatus(prev => ({
                    ...prev,
                    [meal]: !prev[meal]
                }));
                message.success(`${meal.charAt(0).toUpperCase() + meal.slice(1)} ${!mealStatus[meal] ? 'opted in' : 'opted out'}`);
            } else {
                throw new Error('Failed to update meal status');
            }
        } catch (error) {
            console.error('Error updating meal status:', error);
            message.error('Failed to update meal status');
        }
    };
    
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
                                    <Switch
                                        checked={mealStatus.breakfast}
                                        onChange={() => handleMealToggle('breakfast')}
                                    />
                                    <span style={{ marginLeft: '8px' }}>
                                        {mealStatus.breakfast ? 'Opted In' : 'Opted Out'}
                                    </span>
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card>
                                    <Title level={4}>Lunch</Title>
                                    <Switch
                                        checked={mealStatus.lunch}
                                        onChange={() => handleMealToggle('lunch')}
                                    />
                                    <span style={{ marginLeft: '8px' }}>
                                        {mealStatus.lunch ? 'Opted In' : 'Opted Out'}
                                    </span>
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card>
                                    <Title level={4}>Dinner</Title>
                                    <Switch
                                        checked={mealStatus.dinner}
                                        onChange={() => handleMealToggle('dinner')}
                                    />
                                    <span style={{ marginLeft: '8px' }}>
                                        {mealStatus.dinner ? 'Opted In' : 'Opted Out'}
                                    </span>
                                </Card>
                            </Col>
                        </Row>
                        <Row justify="end" style={{ marginTop: '16px' }}>
                            <Button
                                type="primary"
                                onClick={handleSubmit}
                                disabled={isSubmitted}
                            >
                                {isSubmitted ? 'Submitted' : 'Submit Preferences'}
                            </Button>
                        </Row>
                    </Card>

                    <Card className="meal-history-card">
                        <Title level={3}>Meal History</Title>
                        <Calendar
                            fullscreen={false}
                            value={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            cellRender={cellRender}
                            defaultValue={dayjs()}
                        />
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
            <div className="header">
                <Title level={2}>Welcome, {studentData.name || 'Student'}</Title>
                <Button
                    type="primary"
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </div>

            <Tabs defaultActiveKey="1" items={items} />
        </div>
    );
};

export default Dashboard;
        
