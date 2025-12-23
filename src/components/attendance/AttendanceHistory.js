'use client';

import { Table, Tag, Space, Card, Button } from 'antd';
import { UserOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export default function AttendanceHistory({ loading, data, type }) {

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => (
                <Space>
                    <CalendarOutlined style={{ color: '#8c8c8c' }} />
                    {dayjs(date).format('DD MMM YYYY')}
                </Space>
            ),
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
            width: 150,
        },
        {
            title: type === 'student' ? 'Student' : 'Staff',
            key: 'name',
            render: (_, record) => (
                <Space>
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: '#f0f2f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <UserOutlined style={{ color: '#1890ff' }} />
                    </div>
                    <Space direction="vertical" size={0}>
                        {/* Handle populate structure or flattened structure */}
                        <span style={{ fontWeight: 500 }}>
                            {type === 'student'
                                ? `${record.student?.firstName || 'Unknown'} ${record.student?.lastName || ''}`
                                : record.staff?.name || 'Unknown'
                            }
                        </span>
                        <span style={{ fontSize: 11, color: '#8c8c8c' }}>
                            {type === 'student'
                                ? `Roll: ${record.student?.rollNumber || '-'}`
                                : `ID: ${record.staff?.employeeId || '-'}`
                            }
                        </span>
                    </Space>
                </Space>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                switch (status) {
                    case 'present': color = 'success'; break;
                    case 'absent': color = 'error'; break;
                    case 'late': color = 'warning'; break;
                    case 'leave': color = 'processing'; break;
                    default: color = 'default';
                }
                return (
                    <Tag color={color} style={{ minWidth: 60, textAlign: 'center', textTransform: 'capitalize' }}>
                        {status}
                    </Tag>
                );
            },
            filters: [
                { text: 'Present', value: 'present' },
                { text: 'Absent', value: 'absent' },
                { text: 'Late', value: 'late' },
                { text: 'Leave', value: 'leave' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
            render: (text) => text || <span style={{ color: '#d9d9d9', fontStyle: 'italic' }}> - </span>,
        },
    ];

    // If viewing students, show Class/Section
    if (type === 'student') {
        columns.splice(2, 0, {
            title: 'Class',
            key: 'classInfo',
            render: (_, record) => (
                <Tag>{record.class} - {record.section}</Tag>
            ),
        });
    }

    return (
        <Card
            bordered={false}
            title={`Attendance History (${data ? data.length : 0} records)`}
            style={{ marginTop: 16 }}
        >
            <Table
                columns={columns}
                dataSource={data}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true }}
            />
        </Card>
    );
}
