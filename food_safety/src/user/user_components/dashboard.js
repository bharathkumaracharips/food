import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Row, Col, Switch, message, Calendar } from 'antd';
import { LogoutOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
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
    const [hostelDetails, setHostelDetails] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [mealHistory, setMealHistory] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

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
                // Get data from localStorage
                const data = localStorage.getItem('studentData');
                if (!data) {
                    navigate('/user/login');
                    return;
                }

                const parsedData = JSON.parse(data);
                console.log('Student data from localStorage:', parsedData);
                
                if (!parsedData.student) {
                    message.error('Invalid student data');
                    navigate('/user/login');
                    return;
                }

                setStudentData(parsedData.student);

                // Fetch hostel details
                if (parsedData.student.hostelId) {
                    const hostelResponse = await fetch(`http://localhost:5001/hostel/all`);
                    if (hostelResponse.ok) {
                        const hostels = await hostelResponse.json();
                        const hostelData = hostels.find(h => h._id === parsedData.student.hostelId);
                        if (hostelData) {
                            setHostelDetails(hostelData);
                        } else {
                            message.error('Hostel not found');
                        }
                    } else {
                        message.error('Failed to fetch hostel details');
                    }
                }

                // Fetch meal history and set current status
                if (parsedData.student._id) {
                    const historyResponse = await fetch(`http://localhost:5001/student/meal-history/${parsedData.student._id}`);
                    if (historyResponse.ok) {
                        const historyData = await historyResponse.json();
                        setMealHistory(historyData);
                        
                        // Set current meal status based on today's date
                        const today = new Date().toISOString().split('T')[0];
                        const todayHistory = historyData.find(h => h.date === today);
                        if (todayHistory) {
                            const currentStatus = {
                                breakfast: todayHistory.meals.find(m => m.type === 'Breakfast')?.status || false,
                                lunch: todayHistory.meals.find(m => m.type === 'Lunch')?.status || false,
                                dinner: todayHistory.meals.find(m => m.type === 'Dinner')?.status || false
                            };
                            setMealStatus(currentStatus);
                        }
                    } else {
                        message.error('Failed to fetch meal history');
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
                message.error('Failed to load student data');
            }
        };

        fetchData();
    }, [navigate]);

    const handleMealToggle = async (meal, date = new Date()) => {
        if (!studentData?._id) {
            message.error('Student ID not found');
            return;
        }

        // Check if the date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        if (targetDate < today) {
            message.error('Cannot modify meal preferences for past dates');
            return;
        }
        
        try {
            const dateStr = date.toISOString().split('T')[0];
            
            // Find the current status for the specific date
            const dayHistory = mealHistory.find(h => h.date === dateStr);
            const currentStatus = dayHistory?.meals.find(m => 
                m.type.toLowerCase() === meal.toLowerCase()
            )?.status || false;

            const response = await fetch(`http://localhost:5001/student/meal-status/${studentData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    meal,
                    status: !currentStatus,
                    date: dateStr
                }),
            });

            if (response.ok) {
                // Update local state only if the date is today
                const today = new Date().toISOString().split('T')[0];
                if (dateStr === today) {
                    setMealStatus(prev => ({
                        ...prev,
                        [meal]: !currentStatus
                    }));
                }
                
                // Update meal history immediately in state
                setMealHistory(prev => {
                    const updatedHistory = [...prev];
                    const dayIndex = updatedHistory.findIndex(h => h.date === dateStr);
                    
                    if (dayIndex !== -1) {
                        // Update existing day
                        const updatedMeals = updatedHistory[dayIndex].meals.map(m => 
                            m.type.toLowerCase() === meal.toLowerCase() 
                                ? { ...m, status: !currentStatus }
                                : m
                        );
                        updatedHistory[dayIndex] = {
                            ...updatedHistory[dayIndex],
                            meals: updatedMeals
                        };
                    } else {
                        // Add new day
                        updatedHistory.push({
                            date: dateStr,
                            meals: [
                                {
                                    type: 'Breakfast',
                                    status: meal === 'breakfast' ? !currentStatus : false
                                },
                                {
                                    type: 'Lunch',
                                    status: meal === 'lunch' ? !currentStatus : false
                                },
                                {
                                    type: 'Dinner',
                                    status: meal === 'dinner' ? !currentStatus : false
                                }
                            ]
                        });
                    }
                    return updatedHistory;
                });
                
                message.success(`${meal.charAt(0).toUpperCase() + meal.slice(1)} ${!currentStatus ? 'opted in' : 'opted out'} for ${dateStr}`);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update meal status');
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

    const dateCellRender = (value) => {
        const date = value.format('YYYY-MM-DD');
        const dayHistory = mealHistory.find(h => h.date === date);
        
        // Check if the date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const cellDate = value.toDate();
        cellDate.setHours(0, 0, 0, 0);
        const isPastDate = cellDate < today;
        
        if (dayHistory) {
            return (
                <ul className="meal-history-list">
                    {dayHistory.meals.map((meal, index) => (
                        <li 
                            key={index} 
                            className={`${meal.status ? 'opted-in' : 'opted-out'} meal-item ${isPastDate ? 'past-date' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isPastDate) {
                                    handleMealToggle(meal.type.toLowerCase(), value.toDate());
                                }
                            }}
                        >
                            {meal.type}
                        </li>
                    ))}
                </ul>
            );
        }
        return null;
    };

    if (!studentData) {
        return <div className="dashboard-container">Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <Title level={2}>Welcome, {studentData.name || 'Student'}</Title>
                    <div className="current-time">
                        <ClockCircleOutlined /> {currentTime.toLocaleString()}
                    </div>
                </div>
                <Button 
                    type="primary" 
                    danger 
                    icon={<LogoutOutlined />} 
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </div>

            <Card title="Student Information" className="info-card">
                <div className="student-info">
                    <div className="info-item">
                        <label>Hostel Name:</label>
                        <span>{hostelDetails?.name || 'Loading...'}</span>
                    </div>
                    <div className="info-item">
                        <label>Room Number:</label>
                        <span>{studentData.roomNo || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <label>Username:</label>
                        <span>{studentData.username || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <label>Email:</label>
                        <span>{studentData.email || 'N/A'}</span>
                    </div>
                </div>
            </Card>

            <Card title="Today's Meal Preferences" className="meal-preferences-card">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <Card
                            className="meal-card"
                            title="Breakfast"
                            extra={
                                <Switch
                                    checked={mealStatus.breakfast}
                                    onChange={() => handleMealToggle('breakfast')}
                                />
                            }
                        >
                            Status: {mealStatus.breakfast ? 'Opted In' : 'Opted Out'}
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card
                            className="meal-card"
                            title="Lunch"
                            extra={
                                <Switch
                                    checked={mealStatus.lunch}
                                    onChange={() => handleMealToggle('lunch')}
                                />
                            }
                        >
                            Status: {mealStatus.lunch ? 'Opted In' : 'Opted Out'}
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card
                            className="meal-card"
                            title="Dinner"
                            extra={
                                <Switch
                                    checked={mealStatus.dinner}
                                    onChange={() => handleMealToggle('dinner')}
                                />
                            }
                        >
                            Status: {mealStatus.dinner ? 'Opted In' : 'Opted Out'}
                        </Card>
                    </Col>
                </Row>
            </Card>

            <Card title="Meal History" className="meal-history-card">
                <Calendar 
                    dateCellRender={dateCellRender}
                    fullscreen={false}
                    className="meal-calendar"
                />
            </Card>
        </div>
    );
};

export default Dashboard;
        
