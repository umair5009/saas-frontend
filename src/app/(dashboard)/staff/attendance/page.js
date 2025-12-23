'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    Table,
    Button,
    Space,
    DatePicker,
    Select,
    Tag,
    message,
    Modal,
    Form,
    Input,
    Row,
    Col,
    Statistic,
} from 'antd';
import {
    CalendarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { staffApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

export default function StaffAttendancePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [staff, setStaff] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [filters, setFilters] = useState({});
    const [stats, setStats] = useState({
        total: 0,
        present: 0,
        absent: 0,
        leave: 0,
    });

    useEffect(() => {
        fetchStaff();
    }, [selectedDate, filters]);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const data = await staffApi.getAll({ status: 'active', ...filters });
            if (data.success) {
                setStaff(data.data || []);
                calculateStats(data.data || []);
            }
        } catch (error) {
            message.error('Failed to fetch staff');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (staffData) => {
        setStats({
            total: staffData.length,
            present: staffData.filter(s => s.attendanceSummary?.presentDays > 0).length,
            absent: staffData.filter(s => s.attendanceSummary?.absentDays > 0).length,
            leave: staffData.filter(s => s.status === 'on_leave').length,
        });
    };

    const columns = [
        {
            title: 'Employee ID',
            dataIndex: 'employeeId',
            key: 'employeeId',
        },
        {
            title: 'Name',
            key: 'name',
            render: (_, record) => `${record.firstName} ${record.lastName}`,
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
            render: (dept) => dept?.toUpperCase(),
        },
        {
            title: 'Total Days',
            key: 'totalDays',
            render: (_, record) => record.attendanceSummary?.totalDays || 0,
        },
        {
            title: 'Present',
            key: 'present',
            render: (_, record) => (
                <Tag color="green">{record.attendanceSummary?.presentDays || 0}</Tag>
            ),
        },
        {
            title: 'Absent',
            key: 'absent',
            render: (_, record) => (
                <Tag color="red">{record.attendanceSummary?.absentDays || 0}</Tag>
            ),
        },
        {
            title: 'Leave',
            key: 'leave',
            render: (_, record) => (
                <Tag color="orange">{record.attendanceSummary?.leaveDays || 0}</Tag>
            ),
        },
        {
            title: 'Attendance %',
            key: 'percentage',
            render: (_, record) => {
                const percentage = record.attendanceSummary?.attendancePercentage || 0;
                return (
                    <Tag color={percentage >= 90 ? 'green' : percentage >= 75 ? 'orange' : 'red'}>
                        {percentage.toFixed(2)}%
                    </Tag>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => router.push(`/staff/${record._id}`)}>
                        View Details
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="fade-in">
            <PageHeader
                title="Staff Attendance"
                subtitle="Track and manage staff attendance records"
                breadcrumbs={[
                    { title: 'Staff', path: '/staff' },
                    { title: 'Attendance' },
                ]}
                backButton
            />

            {/* Statistics */}
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Total Staff"
                            value={stats.total}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Present Today"
                            value={stats.present}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Absent Today"
                            value={stats.absent}
                            valueStyle={{ color: '#ff4d4f' }}
                            prefix={<CloseCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="On Leave"
                            value={stats.leave}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 16, borderRadius: 12 }}>
                <Row gutter={16}>
                    <Col xs={24} sm={8}>
                        <DatePicker
                            value={selectedDate}
                            onChange={setSelectedDate}
                            style={{ width: '100%' }}
                            placeholder="Select Date"
                            disabledDate={(current) => current && current > dayjs().endOf('day')}
                        />
                    </Col>
                    <Col xs={24} sm={8}>
                        <Select
                            placeholder="Department"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={(v) => setFilters({ ...filters, department: v })}
                        >
                            <Option value="academic">Academic</Option>
                            <Option value="administration">Administration</Option>
                            <Option value="accounts">Accounts</Option>
                            <Option value="library">Library</Option>
                            <Option value="sports">Sports</Option>
                            <Option value="it">IT</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Select
                            placeholder="Status"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={(v) => setFilters({ ...filters, status: v })}
                        >
                            <Option value="active">Active</Option>
                            <Option value="on_leave">On Leave</Option>
                        </Select>
                    </Col>
                </Row>
            </Card>

            {/* Attendance Table */}
            <Card style={{ borderRadius: 12 }}>
                <Table
                    columns={columns}
                    dataSource={staff}
                    loading={loading}
                    rowKey="_id"
                    pagination={{
                        pageSize: 20,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} staff members`,
                    }}
                />
            </Card>
        </div>
    );
}
