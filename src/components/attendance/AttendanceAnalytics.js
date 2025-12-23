'use client';

import { Card, Row, Col, Statistic, Empty, Spin } from 'antd';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#52c41a', '#ff4d4f', '#faad14', '#1890ff'];

export default function AttendanceAnalytics({ loading, summary, dailyTrend }) {
    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!summary || summary.length === 0) {
        return <Empty description="No attendance data found for the selected range" />;
    }

    // Transform summary for Pie Chart
    // summary input: [{ _id: 'present', count: 10 }, { _id: 'absent', count: 2 }]
    const pieData = summary.map(item => ({
        name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
        value: item.count
    }));

    // Prepare colors map based on status
    const getColor = (status) => {
        switch (status.toLowerCase()) {
            case 'present': return '#52c41a';
            case 'absent': return '#ff4d4f';
            case 'late': return '#faad14';
            case 'leave': return '#1890ff';
            default: return '#8884d8';
        }
    };

    // Transform daily trend for Bar Chart
    // dailyTrend input: [{ _id: { date: '2025-12-01', status: 'present' }, count: 5 }]
    // Output needed: [{ date: '2025-12-01', present: 5, absent: 0, ... }]
    const chartData = [];
    const dateMap = new Map();

    if (dailyTrend) {
        dailyTrend.forEach(item => {
            const date = item._id.date;
            const status = item._id.status;
            const count = item.count;

            if (!dateMap.has(date)) {
                dateMap.set(date, { date, present: 0, absent: 0, late: 0, leave: 0 });
            }
            const dateEntry = dateMap.get(date);
            dateEntry[status] = count;
        });

        dateMap.forEach(value => chartData.push(value));
        chartData.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    return (
        <div className="analytics-container">
            {/* Summary Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {pieData.map((item, index) => (
                    <Col xs={12} sm={6} md={6} key={item.name}>
                        <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <Statistic
                                title={item.name}
                                value={item.value}
                                valueStyle={{ color: getColor(item.name) }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[24, 24]}>
                {/* Daily Trend Chart */}
                <Col xs={24} lg={16}>
                    <Card title="Attendance Trends (Daily)" bordered={false} style={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="present" stackId="a" fill="#52c41a" name="Present" />
                                <Bar dataKey="late" stackId="a" fill="#faad14" name="Late" />
                                <Bar dataKey="absent" stackId="a" fill="#ff4d4f" name="Absent" />
                                <Bar dataKey="leave" stackId="a" fill="#1890ff" name="Leave" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Overall Distribution Pie Chart */}
                <Col xs={24} lg={8}>
                    <Card title="Overall Distribution" bordered={false} style={{ height: 400 }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        label
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
