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
                console.log('Fetching students for hostel:', hostelId); // Debug log
                const response = await fetch(`http://localhost:5001/api/hostel/get-all-students/${hostelId}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log('Received students data:', data); // Debug log
                    setStudents(data);
                    if (data.length > 0) {
                        setSelectedStudent(data[0]._id); // Auto-select first student
                    }
                } else {
                    const errorText = await response.text();
                    console.error('Server response:', errorText); // Debug log
                    throw new Error('Failed to fetch students');
                }
            } catch (error) {
                console.error('Error fetching students:', error);
                message.error('Failed to fetch students');
            }
        };

        if (hostelId) {
            fetchStudents();
        }
    }, [hostelId]);

    // Fetch meal history for selected student
    useEffect(() => {
        const fetchMealHistory = async () => {
            if (!selectedStudent) return;

            setLoading(true);
            try {
                console.log('Fetching meal history for student:', selectedStudent); // Debug log
                const response = await fetch(`http://localhost:5001/api/student/meal-history/${selectedStudent}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log('Received meal history:', data); // Debug log
                    // Convert dates to moment objects and ensure meals array exists
                    const formattedData = data.map(day => ({
                        ...day,
                        date: moment(day.date).format('YYYY-MM-DD'),
                        meals: day.meals || []
                    }));
                    setMealHistory(formattedData);
                    calculateMonthlyStats(formattedData, selectedMonth);
                } else {
                    const errorText = await response.text();
                    console.error('Server response:', errorText); // Debug log
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
        if (!month || !Array.isArray(history)) return;

        const startDate = moment(month).startOf('month').format('YYYY-MM-DD');
        const endDate = moment(month).endOf('month').format('YYYY-MM-DD');

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

    const cellRender = (current) => {
        const date = current.format('YYYY-MM-DD');
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

                <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                    <Col span={24}>
                        <Calendar 
                            loading={loading}
                            cellRender={(current) => cellRender(current)}
                            value={selectedMonth}
                        />
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                    <Col span={24}>
                        <Table 
                            columns={columns} 
                            dataSource={tableData} 
                            pagination={false}
                            summary={() => (
                                <Table.Summary>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell>Total</Table.Summary.Cell>
                                        <Table.Summary.Cell>
                                            {monthlyStats.totalBreakfast + monthlyStats.totalLunch + monthlyStats.totalDinner}
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell>
                                            ₹{monthlyStats.totalCost}
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                </Table.Summary>
                            )}
                        />
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default MealMonitoring; 