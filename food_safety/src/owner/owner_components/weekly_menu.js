import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Card, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import './weekly_menu.css';

const { Title } = Typography;

const WeeklyMenu = () => {
    const [menuData, setMenuData] = useState({
        Monday: {
            breakfast: 'Idli, Sambar, Chutney',
            lunch: 'Rice, Dal, Vegetable Curry, Chapati',
            dinner: 'Rice, Dal, Mixed Vegetable, Chapati'
        },
        Tuesday: {
            breakfast: 'Dosa, Chutney, Sambar',
            lunch: 'Rice, Dal, Chicken Curry, Chapati',
            dinner: 'Rice, Dal, Fish Curry, Chapati'
        },
        Wednesday: {
            breakfast: 'Pongal, Chutney, Sambar',
            lunch: 'Rice, Dal, Egg Curry, Chapati',
            dinner: 'Rice, Dal, Paneer Curry, Chapati'
        },
        Thursday: {
            breakfast: 'Upma, Chutney, Sambar',
            lunch: 'Rice, Dal, Vegetable Curry, Chapati',
            dinner: 'Rice, Dal, Chicken Curry, Chapati'
        },
        Friday: {
            breakfast: 'Idli, Sambar, Chutney',
            lunch: 'Rice, Dal, Fish Curry, Chapati',
            dinner: 'Rice, Dal, Mixed Vegetable, Chapati'
        },
        Saturday: {
            breakfast: 'Dosa, Chutney, Sambar',
            lunch: 'Rice, Dal, Egg Curry, Chapati',
            dinner: 'Rice, Dal, Paneer Curry, Chapati'
        },
        Sunday: {
            breakfast: 'Pongal, Chutney, Sambar',
            lunch: 'Rice, Dal, Chicken Curry, Chapati',
            dinner: 'Rice, Dal, Vegetable Curry, Chapati'
        }
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingDay, setEditingDay] = useState(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const hostelData = JSON.parse(localStorage.getItem('hostelData'));
        console.log('Hostel data from localStorage:', hostelData); // Debug log
        if (hostelData && hostelData.id) {
            fetchMenuData(hostelData.id);
        } else {
            message.error('Please login again');
            setLoading(false);
        }
    }, []);

    const fetchMenuData = async (hostelId) => {
        try {
            console.log('Fetching menu for hostelId:', hostelId); // Debug log
            const response = await fetch(`http://localhost:5001/api/menu/weekly/${hostelId}`);
            const data = await response.json();
            console.log('Fetched menu data:', data); // Debug log

            if (response.ok && data && data.menu) {
                setMenuData(data.menu);
            } else {
                // If no menu data exists or there's an error, save the default menu
                console.log('No menu found, creating default menu'); // Debug log
                await saveMenuData(menuData, hostelId);
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
            message.error('Failed to load menu data');
        } finally {
            setLoading(false);
        }
    };

    const saveMenuData = async (data, hostelId) => {
        try {
            console.log('Saving menu for hostelId:', hostelId); // Debug log
            console.log('Menu data to save:', data); // Debug log

            const response = await fetch(`http://localhost:5001/api/menu/weekly/${hostelId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    menu: data
                }),
            });

            const responseData = await response.json();
            console.log('Save response:', responseData); // Debug log

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to save menu data');
            }

            if (responseData && responseData.menu) {
                setMenuData(responseData.menu.menu || responseData.menu);
                message.success('Menu updated successfully');
            }
        } catch (error) {
            console.error('Error saving menu:', error);
            message.error('Failed to save menu data: ' + error.message);
        }
    };

    const handleEdit = (day) => {
        setEditingDay(day);
        form.setFieldsValue(menuData[day]);
        setIsModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const updatedMenuData = {
                ...menuData,
                [editingDay]: values
            };
            
            const hostelData = JSON.parse(localStorage.getItem('hostelData'));
            if (!hostelData || !hostelData.id) {
                message.error('Please login again');
                return;
            }

            setMenuData(updatedMenuData);
            await saveMenuData(updatedMenuData, hostelData.id);
            setIsModalVisible(false);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const getCurrentDayMenu = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[new Date().getDay()];
        return menuData[currentDay];
    };

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
        },
        {
            title: 'Lunch',
            dataIndex: 'lunch',
            key: 'lunch',
        },
        {
            title: 'Dinner',
            dataIndex: 'dinner',
            key: 'dinner',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record.day)}
                >
                    Edit
                </Button>
            ),
        },
    ];

    const tableData = Object.entries(menuData).map(([day, meals]) => ({
        key: day,
        day,
        ...meals
    }));

    return (
        <div className="weekly-menu-container">
            <Title level={2}>Weekly Menu Management</Title>
            
            <Card title="Today's Menu" className="today-menu-card">
                <div className="today-menu-content">
                    <h3>{Object.keys(menuData)[new Date().getDay()]}</h3>
                    <p><strong>Breakfast:</strong> {getCurrentDayMenu().breakfast}</p>
                    <p><strong>Lunch:</strong> {getCurrentDayMenu().lunch}</p>
                    <p><strong>Dinner:</strong> {getCurrentDayMenu().dinner}</p>
                </div>
            </Card>

            <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                loading={loading}
                className="menu-table"
            />

            <Modal
                title={`Edit Menu for ${editingDay}`}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="breakfast"
                        label="Breakfast"
                        rules={[{ required: true, message: 'Please input breakfast menu!' }]}
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item
                        name="lunch"
                        label="Lunch"
                        rules={[{ required: true, message: 'Please input lunch menu!' }]}
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item
                        name="dinner"
                        label="Dinner"
                        rules={[{ required: true, message: 'Please input dinner menu!' }]}
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default WeeklyMenu; 