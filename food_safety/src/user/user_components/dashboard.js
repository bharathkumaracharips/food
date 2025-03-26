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
    const [isSubmitted, setIsSubmitted] = useState(false);
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
                        const today = new Date().toLocaleDateString('en-CA');
                        const todayHistory = historyData.find(h => h.date === today);
                        if (todayHistory) {
                            const currentStatus = {
                                breakfast: todayHistory.meals.find(m => m.type === 'Breakfast')?.status || false,
                                lunch: todayHistory.meals.find(m => m.type === 'Lunch')?.status || false,
                                dinner: todayHistory.meals.find(m => m.type === 'Dinner')?.status || false
                            };
                            setMealStatus(currentStatus);
                            setIsSubmitted(todayHistory.isSubmitted || false);
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

    const handleSubmit = async () => {
        if (!studentData?._id) {
            message.error('Student ID not found');
            return;
        }

        try {
            const today = new Date().toLocaleDateString('en-CA');
            const response = await fetch(`http://localhost:5001/student/submit-meals/${studentData._id}`, {
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
                const responseData = await response.json();
                setIsSubmitted(true);
                message.success('Meal preferences submitted successfully');
                
                // Update meal history to reflect submission
                setMealHistory(prev => {
                    const updatedHistory = [...prev];
                    const todayIndex = updatedHistory.findIndex(h => h.date === today);
                    if (todayIndex !== -1) {
                        updatedHistory[todayIndex] = {
                            date: today,
                            meals: [
                                { type: 'Breakfast', status: mealStatus.breakfast },
                                { type: 'Lunch', status: mealStatus.lunch },
                                { type: 'Dinner', status: mealStatus.dinner }
                            ],
                            isSubmitted: true
                        };
                    } else {
                        // Add new entry if not found
                        updatedHistory.unshift({
                            date: today,
                            meals: [
                                { type: 'Breakfast', status: mealStatus.breakfast },
                                { type: 'Lunch', status: mealStatus.lunch },
                                { type: 'Dinner', status: mealStatus.dinner }
                            ],
                            isSubmitted: true
                        });
                    }
                    return updatedHistory;
                });

                // Refresh meal history from server to ensure consistency
                const historyResponse = await fetch(`http://localhost:5001/student/meal-history/${studentData._id}`);
                if (historyResponse.ok) {
                    const historyData = await historyResponse.json();
                    setMealHistory(historyData);
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit meal preferences');
            }
        } catch (error) {
            console.error('Error submitting meal preferences:', error);
            message.error('Failed to submit meal preferences');
        }
    };

    const handleMealToggle = async (meal, date = new Date()) => {
        if (!studentData?._id) {
            message.error('Student ID not found');
            return;
        }

        // Check if already submitted for today
        const today = new Date().toLocaleDateString('en-CA');
        const todayHistory = mealHistory.find(h => h.date === today);
        if (todayHistory?.isSubmitted) {
            message.error('Meal preferences have been submitted and cannot be changed');
            return;
        }

        // Check if the date is in the past
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        
        // Ensure we're working with the correct date
        const targetDate = date instanceof Date ? date : new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        if (targetDate < todayDate) {
            message.error('Cannot modify meal preferences for past dates');
            return;
        }

        // Format date in YYYY-MM-DD format for the current timezone
        const dateStr = targetDate.toLocaleDateString('en-CA');
        
        try {
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
                const todayStr = new Date().toLocaleDateString('en-CA');
                if (dateStr === todayStr) {
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

    const cellRender = (value) => {
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
                                    disabled={isSubmitted}
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
                                    disabled={isSubmitted}
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
                                    disabled={isSubmitted}
                                />
                            }
                        >
                            Status: {mealStatus.dinner ? 'Opted In' : 'Opted Out'}
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

            <Card title="Meal History" className="meal-history-card">
                <Calendar cellRender={cellRender} />
            </Card>
        </div>
    );
};

export default Dashboard;
        
