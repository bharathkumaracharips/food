import React, { useState, useEffect } from 'react';
import { Card, Calendar, Select, Table, Statistic, Row, Col, DatePicker, message } from 'antd';
import moment from 'moment';
import './meal_monitoring.css';

const { Option } = Select;

const MealMonitoring = ({ hostelId }) => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [mealHistory, setMealHistory] = useState([]);
    const [monthlyStats, setMonthlyStats] = useState({
        totalBreakfast: 0,
        totalLunch: 0,
        totalDinner: 0,
        totalCost: 0
    });
    const [selectedMonth, setSelectedMonth] = useState(moment()); // Initialize with moment
    const [loading, setLoading] = useState(false);

    // Fetch students
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch(`http://localhost:5001/hostel/get-all-students/${hostelId}`);
                if (response.ok) {
                    const data = await response.json();
                    setStudents(data);
                    if (data.length > 0) {
                        setSelectedStudent(data[0]._id); // Auto-select first student
                    }
                } else {
                    throw new Error('Failed to fetch students');
                }
            } catch (error) {
                console.error('Error fetching students:', error);
                message.error('Failed to fetch students');
            }
        };

        fetchStudents();
    }, [hostelId]);

    // Fetch meal history for selected student
    useEffect(() => {
        const fetchMealHistory = async () => {
            if (!selectedStudent) return;

            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5001/student/meal-history/${selectedStudent}`);
                if (response.ok) {
                    const data = await response.json();
                    // Convert dates to moment objects
                    const formattedData = data.map(day => ({
                        ...day,
                        date: moment(day.date).format('YYYY-MM-DD')
                    }));
                    setMealHistory(formattedData);
                    calculateMonthlyStats(formattedData, selectedMonth);
                } else {
                    throw new Error('Failed to fetch meal history');
                }
            } catch (error) {
                console.error('Error fetching meal history:', error);
                message.error('Failed to fetch meal history');
            } finally {
                setLoading(false);
            }
        };

        fetchMealHistory();
    }, [selectedStudent, selectedMonth]);

    const calculateMonthlyStats = (history, month) => {
        const startDate = month.startOf('month').format('YYYY-MM-DD');
        const endDate = month.endOf('month').format('YYYY-MM-DD');

        const monthlyMeals = history.filter(day => {
            return day.date >= startDate && day.date <= endDate;
        });

        const stats = monthlyMeals.reduce((acc, day) => {
            if (Array.isArray(day.meals)) {
                day.meals.forEach(meal => {
                    if (meal.status) {
                        switch (meal.type.toLowerCase()) {
                            case 'breakfast':
                                acc.totalBreakfast++;
                                acc.totalCost += 50;
                                break;
                            case 'lunch':
                                acc.totalLunch++;
                                acc.totalCost += 80;
                                break;
                            case 'dinner':
                                acc.totalDinner++;
                                acc.totalCost += 80;
                                break;
                            default:
                                break;
                        }
                    }
                });
            }
            return acc;
        }, {
            totalBreakfast: 0,
            totalLunch: 0,
            totalDinner: 0,
            totalCost: 0
        });

        setMonthlyStats(stats);
    };

    const dateCellRender = (value) => {
        const date = value.format('YYYY-MM-DD');
        const dayHistory = mealHistory.find(h => h.date === date);
        
        if (dayHistory && Array.isArray(dayHistory.meals)) {
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

    const columns = [
        {
            title: 'Meal Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Total Count',
            dataIndex: 'count',
            key: 'count',
        },
        {
            title: 'Cost',
            dataIndex: 'cost',
            key: 'cost',
            render: (text) => `₹${text}`
        }
    ];

    const tableData = [
        {
            key: '1',
            type: 'Breakfast',
            count: monthlyStats.totalBreakfast,
            cost: monthlyStats.totalBreakfast * 50
        },
        {
            key: '2',
            type: 'Lunch',
            count: monthlyStats.totalLunch,
            cost: monthlyStats.totalLunch * 80
        },
        {
            key: '3',
            type: 'Dinner',
            count: monthlyStats.totalDinner,
            cost: monthlyStats.totalDinner * 80
        }
    ];

    return (
        <div className="meal-monitoring">
            <Card title="Meal Monitoring" className="monitoring-card">
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Select
                            placeholder="Select Student"
                            style={{ width: '100%' }}
                            onChange={setSelectedStudent}
                            value={selectedStudent}
                        >
                            {students.map(student => (
                                <Option key={student._id} value={student._id}>
                                    {student.name} - Room {student.roomNo}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={12}>
                        <DatePicker.MonthPicker
                            value={selectedMonth}
                            onChange={(date) => setSelectedMonth(date)}
                            style={{ width: '100%' }}
                        />
                    </Col>
                </Row>
            </Card>

            {selectedStudent && (
                <>
                    <Card title="Monthly Statistics" className="stats-card">
                        <Row gutter={[16, 16]}>
                            <Col span={6}>
                                <Statistic
                                    title="Total Breakfast"
                                    value={monthlyStats.totalBreakfast}
                                    suffix="meals"
                                    loading={loading}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Total Lunch"
                                    value={monthlyStats.totalLunch}
                                    suffix="meals"
                                    loading={loading}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Total Dinner"
                                    value={monthlyStats.totalDinner}
                                    suffix="meals"
                                    loading={loading}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Total Cost"
                                    value={monthlyStats.totalCost}
                                    prefix="₹"
                                    loading={loading}
                                />
                            </Col>
                        </Row>
                    </Card>

                    <Card title="Meal Details" className="details-card">
                        <Table 
                            columns={columns} 
                            dataSource={tableData} 
                            pagination={false}
                            loading={loading}
                        />
                    </Card>

                    <Card title="Meal Calendar" className="calendar-card">
                        <Calendar 
                            dateCellRender={dateCellRender}
                            fullscreen={false}
                            className="meal-calendar"
                            value={selectedMonth}
                            loading={loading}
                        />
                    </Card>
                </>
            )}
        </div>
    );
};

export default MealMonitoring; 