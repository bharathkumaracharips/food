import React, { useState, useEffect } from 'react';
import { Table, Tag, message, Button, Row, Col, Card, Statistic } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import './tabel_for_food.css';

const StudentFoodTable = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        breakfast: 0,
        lunch: 0,
        dinner: 0
    });
    const hostelData = JSON.parse(localStorage.getItem('hostelData'));

    const fetchStudents = async () => {
        if (!hostelData || !hostelData.id) {
            message.error('Hostel information not found');
            return;
        }

        setLoading(true);
        try {
            // First fetch all students
            const studentsResponse = await fetch(`http://localhost:5001/hostel/get-all-students/${hostelData.id}`);
            if (!studentsResponse.ok) {
                throw new Error('Failed to fetch students');
            }
            const studentsData = await studentsResponse.json();

            // Then fetch today's meal status for each student
            const processedData = await Promise.all(studentsData.map(async (student) => {
                try {
                    const mealResponse = await fetch(`http://localhost:5001/student/get-today-meals/${student._id}`);
                    if (!mealResponse.ok) {
                        return {
                            ...student,
                            key: student._id,
                            breakfast: false,
                            lunch: false,
                            dinner: false
                        };
                    }
                    const mealData = await mealResponse.json();
                    
                    return {
                        ...student,
                        key: student._id,
                        breakfast: mealData.find(m => m.type.toLowerCase() === 'breakfast')?.status || false,
                        lunch: mealData.find(m => m.type.toLowerCase() === 'lunch')?.status || false,
                        dinner: mealData.find(m => m.type.toLowerCase() === 'dinner')?.status || false
                    };
                } catch (error) {
                    console.error(`Error fetching meals for student ${student._id}:`, error);
                    return {
                        ...student,
                        key: student._id,
                        breakfast: false,
                        lunch: false,
                        dinner: false
                    };
                }
            }));
            
            setStudents(processedData);

            // Calculate statistics
            const newStats = processedData.reduce((acc, student) => ({
                breakfast: acc.breakfast + (student.breakfast ? 1 : 0),
                lunch: acc.lunch + (student.lunch ? 1 : 0),
                dinner: acc.dinner + (student.dinner ? 1 : 0)
            }), { breakfast: 0, lunch: 0, dinner: 0 });

            setStats(newStats);
        } catch (error) {
            console.error('Error fetching students:', error);
            message.error('Failed to load students data');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch only
    useEffect(() => {
        fetchStudents();
    }, []);

    const handleRefresh = () => {
        if (!loading) {
            fetchStudents();
            message.success('Data refreshed');
        }
    };

    const renderStatus = (status) => {
        return (
            <Tag className={`status-tag ${status ? 'opted-in' : 'opted-out'}`}>
                {status ? 'Opted In' : 'Opted Out'}
            </Tag>
        );
    };

    const columns = [
        {
            title: 'Room No',
            dataIndex: 'roomNo',
            key: 'roomNo',
            sorter: (a, b) => a.roomNo.localeCompare(b.roomNo),
            render: (text) => <span className="room-number">{text}</span>,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text) => <span className="student-name">{text}</span>,
        },
        {
            title: 'Breakfast',
            dataIndex: 'breakfast',
            key: 'breakfast',
            filters: [
                { text: 'Opted In', value: true },
                { text: 'Opted Out', value: false },
            ],
            onFilter: (value, record) => record.breakfast === value,
            render: renderStatus,
        },
        {
            title: 'Lunch',
            dataIndex: 'lunch',
            key: 'lunch',
            filters: [
                { text: 'Opted In', value: true },
                { text: 'Opted Out', value: false },
            ],
            onFilter: (value, record) => record.lunch === value,
            render: renderStatus,
        },
        {
            title: 'Dinner',
            dataIndex: 'dinner',
            key: 'dinner',
            filters: [
                { text: 'Opted In', value: true },
                { text: 'Opted Out', value: false },
            ],
            onFilter: (value, record) => record.dinner === value,
            render: renderStatus,
        },
    ];

    return (
        <div className="food-table-container">
            <Row gutter={[16, 16]} className="stats-row">
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Total Breakfast"
                            value={stats.breakfast}
                            suffix="students"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Total Lunch"
                            value={stats.lunch}
                            suffix="students"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Total Dinner"
                            value={stats.dinner}
                            suffix="students"
                        />
                    </Card>
                </Col>
            </Row>

            <div className="table-header">
                <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    loading={loading}
                    className="refresh-button"
                >
                    Refresh
                </Button>
            </div>

            <Table
                className="food-table"
                columns={columns}
                dataSource={students}
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} students`,
                }}
            />
        </div>
    );
};

export default StudentFoodTable;