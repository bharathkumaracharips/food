import React, { useState, useEffect } from 'react';
import { Card, Table, Button, message, Typography, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import './student_menu_view.css';
import axios from 'axios';

const { Title } = Typography;

const StudentMenuView = () => {
    const [menuData, setMenuData] = useState(null);
    const [mealPreferences, setMealPreferences] = useState({
        breakfast: true,
        lunch: true,
        dinner: true
    });
    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [mealHistory, setMealHistory] = useState([]);

    useEffect(() => {
        const storedStudentData = localStorage.getItem('studentData');
        console.log('Stored student data:', storedStudentData);
        if (storedStudentData) {
            const parsedData = JSON.parse(storedStudentData);
            setStudentData(parsedData);
            if (parsedData.student && parsedData.student.hostelId) {
                fetchMenuData(parsedData.student.hostelId);
                // First fetch meal history to check submission status
                fetchMealHistory(parsedData.student._id);
            } else {
                message.error('Hostel information not found');
                setLoading(false);
            }
        } else {
            message.error('Student data not found');
            setLoading(false);
        }
    }, []);

    const fetchMenuData = async (hostelId) => {
        try {
            console.log('Fetching menu for hostelId:', hostelId); // Debug log
            const response = await fetch(`http://localhost:5001/api/menu/weekly/${hostelId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch menu data');
            }
            const data = await response.json();
            console.log('Received menu data:', data); // Debug log
            if (data && data.menu) {
                setMenuData(data.menu);
            } else {
                message.error('No menu data available for your hostel');
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
            message.error('Failed to load menu data');
        } finally {
            setLoading(false);
        }
    };

    const fetchMealHistory = async (studentId) => {
        try {
            const response = await axios.get(`http://localhost:5001/api/student/meal-history/${studentId}`);
            const historyData = response.data;
            setMealHistory(historyData);
            
            // Check today's submission status and preferences
            const today = new Date().toLocaleDateString('en-CA');
            
            // Find today's history
            const todayHistory = historyData.find(h => {
                const historyDate = new Date(h.date);
                return historyDate.toISOString().split('T')[0] === today;
            });
            
            if (todayHistory) {
                // Set submission status
                setIsSubmitted(Boolean(todayHistory.isSubmitted));
                
                // If submitted, update meal preferences from history
                if (todayHistory.meals) {
                    const breakfastMeal = todayHistory.meals.find(m => m.type === 'Breakfast');
                    const lunchMeal = todayHistory.meals.find(m => m.type === 'Lunch');
                    const dinnerMeal = todayHistory.meals.find(m => m.type === 'Dinner');
                    
                    const preferences = {
                        breakfast: breakfastMeal?.status ?? false,
                        lunch: lunchMeal?.status ?? false,
                        dinner: dinnerMeal?.status ?? false
                    };
                    setMealPreferences(preferences);
                }
            } else {
                // No history for today, reset submission status
                setIsSubmitted(false);
                setMealPreferences({
                    breakfast: false,
                    lunch: false,
                    dinner: false
                });
            }
        } catch (error) {
            console.error('Error fetching meal history:', error);
            message.error('Failed to fetch meal history');
        }
    };

    const handleMealToggle = async (mealType, status) => {
        // Check submission status first
        if (isSubmitted) {
            message.warning('Meal preferences have already been submitted for today');
            return;
        }

        try {
            const storedData = JSON.parse(localStorage.getItem('studentData'));
            if (!storedData || !storedData.student || !storedData.student._id) {
                message.error('Please login again');
                return;
            }

            // Update local state only
            setMealPreferences(prev => ({
                ...prev,
                [mealType.toLowerCase()]: status
            }));
            
            message.success(`Successfully ${status ? 'opted in for' : 'opted out of'} ${mealType}`);
        } catch (error) {
            console.error('Error updating meal preferences:', error);
            message.error('Failed to update meal preferences');
        }
    };

    const handleSubmit = async () => {
        try {
            const storedData = JSON.parse(localStorage.getItem('studentData'));
            if (!storedData || !storedData.student || !storedData.student._id) {
                message.error('Please login again');
                return;
            }

            const today = new Date().toLocaleDateString('en-CA');
            
            try {
                // Submit meal preferences
                const response = await axios.post(
                    `http://localhost:5001/api/student/submit-meals/${storedData.student._id}`,
                    {
                        date: today,
                        meals: {
                            breakfast: mealPreferences.breakfast,
                            lunch: mealPreferences.lunch,
                            dinner: mealPreferences.dinner
                        }
                    }
                );

                if (response.data) {
                    // Set submission status immediately
                    setIsSubmitted(true);
                    message.success('Meal preferences submitted successfully');
                    
                    // Refresh meal history to get the updated status
                    await fetchMealHistory(storedData.student._id);
                }
            } catch (error) {
                if (error.response && error.response.status === 400 && error.response.data.error === "Meal preferences already submitted for today") {
                    message.warning('Meal preferences have already been submitted for today');
                    setIsSubmitted(true);
                    await fetchMealHistory(storedData.student._id);
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error('Error submitting meal preferences:', error);
            message.error('Failed to submit meal preferences');
        }
    };

    // Add useEffect to periodically check submission status
    useEffect(() => {
        if (!isSubmitted) {
            const interval = setInterval(() => {
                const storedData = JSON.parse(localStorage.getItem('studentData'));
                if (storedData?.student?._id) {
                    fetchMealHistory(storedData.student._id);
                }
            }, 30000); // Check every 30 seconds

            return () => clearInterval(interval);
        }
    }, [isSubmitted]);

    const columns = [
        {
            title: 'Day',
            dataIndex: 'day',
            key: 'day',
        },
        {
            title: 'Breakfast',
            dataIndex: 'breakfast',
            key: 'breakfast',
            render: (text, record) => (
                <div className="meal-cell">
                    <span>{text}</span>
                    {record.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }) && (
                        <Button
                            type={mealPreferences.breakfast ? 'primary' : 'default'}
                            icon={mealPreferences.breakfast ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                            onClick={() => handleMealToggle('breakfast', !mealPreferences.breakfast)}
                            size="small"
                            disabled={isSubmitted}
                        >
                            {mealPreferences.breakfast ? 'Opted In' : 'Opted Out'}
                        </Button>
                    )}
                </div>
            ),
        },
        {
            title: 'Lunch',
            dataIndex: 'lunch',
            key: 'lunch',
            render: (text, record) => (
                <div className="meal-cell">
                    <span>{text}</span>
                    {record.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }) && (
                        <Button
                            type={mealPreferences.lunch ? 'primary' : 'default'}
                            icon={mealPreferences.lunch ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                            onClick={() => handleMealToggle('lunch', !mealPreferences.lunch)}
                            size="small"
                            disabled={isSubmitted}
                        >
                            {mealPreferences.lunch ? 'Opted In' : 'Opted Out'}
                        </Button>
                    )}
                </div>
            ),
        },
        {
            title: 'Dinner',
            dataIndex: 'dinner',
            key: 'dinner',
            render: (text, record) => (
                <div className="meal-cell">
                    <span>{text}</span>
                    {record.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }) && (
                        <Button
                            type={mealPreferences.dinner ? 'primary' : 'default'}
                            icon={mealPreferences.dinner ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                            onClick={() => handleMealToggle('dinner', !mealPreferences.dinner)}
                            size="small"
                            disabled={isSubmitted}
                        >
                            {mealPreferences.dinner ? 'Opted In' : 'Opted Out'}
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const getCurrentDayMenu = () => {
        if (!menuData) return null;
        const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        return menuData[currentDay];
    };

    return (
        <div className="student-menu-container">
            <Title level={2}>Weekly Menu</Title>
            
            <Card title="Today's Menu" className="today-menu-card">
                <div className="today-menu-content">
                    {getCurrentDayMenu() && (
                        <>
                            <h3>{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</h3>
                            <div className="meal-preference-buttons">
                                <Button
                                    type={mealPreferences.breakfast ? 'primary' : 'default'}
                                    icon={mealPreferences.breakfast ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                                    onClick={() => handleMealToggle('breakfast', !mealPreferences.breakfast)}
                                    disabled={isSubmitted}
                                >
                                    Breakfast: {mealPreferences.breakfast ? 'Opted In' : 'Opted Out'}
                                </Button>
                                <Button
                                    type={mealPreferences.lunch ? 'primary' : 'default'}
                                    icon={mealPreferences.lunch ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                                    onClick={() => handleMealToggle('lunch', !mealPreferences.lunch)}
                                    disabled={isSubmitted}
                                >
                                    Lunch: {mealPreferences.lunch ? 'Opted In' : 'Opted Out'}
                                </Button>
                                <Button
                                    type={mealPreferences.dinner ? 'primary' : 'default'}
                                    icon={mealPreferences.dinner ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                                    onClick={() => handleMealToggle('dinner', !mealPreferences.dinner)}
                                    disabled={isSubmitted}
                                >
                                    Dinner: {mealPreferences.dinner ? 'Opted In' : 'Opted Out'}
                                </Button>
                            </div>
                            {!isSubmitted && (
                                <Button
                                    type="primary"
                                    onClick={handleSubmit}
                                    style={{ marginTop: '16px' }}
                                >
                                    Submit Meal Preferences
                                </Button>
                            )}
                            {isSubmitted && (
                                <div style={{ marginTop: '16px', color: '#52c41a' }}>
                                    ✓ Meal preferences have been submitted for today
                                </div>
                            )}
                            <div className="menu-items">
                                <p><strong>Breakfast:</strong> {getCurrentDayMenu().breakfast}</p>
                                <p><strong>Lunch:</strong> {getCurrentDayMenu().lunch}</p>
                                <p><strong>Dinner:</strong> {getCurrentDayMenu().dinner}</p>
                            </div>
                        </>
                    )}
                </div>
            </Card>

            <Table
                columns={columns}
                dataSource={menuData ? Object.entries(menuData).map(([day, meals]) => ({
                    key: day,
                    day,
                    ...meals
                })) : []}
                pagination={false}
                loading={loading}
                className="menu-table"
            />
        </div>
    );
};

export default StudentMenuView; 