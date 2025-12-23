'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    message,
    Modal,
    Form,
    Select,
    DatePicker,
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
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { staffApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

export default function StaffLeavePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [staff, setStaff] = useState([]);
    const [filters, setFilters] = useState({});
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
    });

    useEffect(() => {
        fetchStaff();
    }, [filters]);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const data = await staffApi.getAll({ ...filters });
            if (data.success) {
                const staffData = data.data || [];
                setStaff(staffData);
                calculateStats(staffData);
            }
        } catch (error) {
            message.error('Failed to fetch staff');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (staffData) => {
        let pending = 0, approved = 0, rejected = 0, total = 0;

        staffData.forEach(s => {
            if (s.leaveRecords && s.leaveRecords.length > 0) {
                s.leaveRecords.forEach(leave => {
                    total++;
                    if (leave.status === 'pending') pending++;
                    if (leave.status === 'approved') approved++;
                    if (leave.status === 'rejected') rejected++;
                });
            }
        });

        setStats({ pending, approved, rejected, total });
    };

    const columns = [
        {
            title: 'Employee',
            key: 'employee',
            render: (_, record) => (
                <div>
                    <div>{`${record.firstName} ${record.lastName}`}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.employeeId}</div>
                </div>
            ),
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
            render: (dept) => dept?.toUpperCase(),
        },
        {
            title: 'Leave Balance',
            key: 'balance',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <div>Casual: {record.leaveBalance?.casual || 0}</div>
                    <div>Sick: {record.leaveBalance?.sick || 0}</div>
                    <div>Annual: {record.leaveBalance?.annual || 0}</div>
                </Space>
            ),
        },
        {
            title: 'Pending Leaves',
            key: 'pending',
            render: (_, record) => {
                const pending = record.leaveRecords?.filter(l => l.status === 'pending').length || 0;
                return <Tag color="orange">{pending}</Tag>;
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
                title="Staff Leave Management"
                subtitle="Manage staff leave applications and balances"
                breadcrumbs={[
                    { title: 'Staff', path: '/staff' },
                    { title: 'Leave Management' },
                ]}
                backButton
            />

            {/* Statistics */}
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Total Applications"
                            value={stats.total}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Pending"
                            value={stats.pending}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Approved"
                            value={stats.approved}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Rejected"
                            value={stats.rejected}
                            valueStyle={{ color: '#ff4d4f' }}
                            prefix={<CloseCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 16, borderRadius: 12 }}>
                <Row gutter={16}>
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

            {/* Staff Table */}
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
