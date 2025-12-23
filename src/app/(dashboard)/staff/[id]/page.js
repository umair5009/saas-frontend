'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Card,
    Row,
    Col,
    Typography,
    Descriptions,
    Avatar,
    Tag,
    Space,
    Button,
    Tabs,
    Table,
    Statistic,
    message,
    Spin,
    Divider,
} from 'antd';
import {
    UserOutlined,
    EditOutlined,
    PrinterOutlined,
    MailOutlined,
    PhoneOutlined,
    HomeOutlined,
    CalendarOutlined,
    DollarOutlined,
    TeamOutlined,
    TrophyOutlined,
    BookOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import StatusTag from '@/components/common/StatusTag';
import { staffApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function StaffDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const staffId = params.id;

    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchStaff();
    }, [staffId]);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const data = await staffApi.getById(staffId);
            if (data.success) {
                setStaff(data.data);
            } else {
                message.error('Failed to fetch staff details');
                router.push('/staff');
            }
        } catch (error) {
            message.error('Failed to fetch staff details');
            router.push('/staff');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!staff) {
        return (
            <Card>
                <Text>Staff member not found</Text>
            </Card>
        );
    }

    const Overview = () => (
        <Row gutter={[24, 24]}>
            {/* Stats Cards */}
            <Col xs={24} md={6}>
                <Card style={{ borderRadius: 12 }}>
                    <Statistic
                        title="Attendance"
                        value={staff.attendanceSummary?.attendancePercentage || 0}
                        suffix="%"
                        prefix={<CalendarOutlined />}
                        valueStyle={{ color: staff.attendanceSummary?.attendancePercentage >= 90 ? '#52c41a' : '#ff4d4f' }}
                    />
                </Card>
            </Col>
            <Col xs={24} md={6}>
                <Card style={{ borderRadius: 12 }}>
                    <Statistic
                        title="Gross Salary"
                        value={staff.salary?.grossSalary || 0}
                        prefix="Rs."
                        valueStyle={{ color: '#1890ff' }}
                    />
                </Card>
            </Col>
            <Col xs={24} md={6}>
                <Card style={{ borderRadius: 12 }}>
                    <Statistic
                        title="Experience"
                        value={staff.joiningDate ? dayjs().diff(dayjs(staff.joiningDate), 'year') : 0}
                        suffix="years"
                        prefix={<TrophyOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} md={6}>
                <Card style={{ borderRadius: 12 }}>
                    <Statistic
                        title="Leave Balance"
                        value={staff.leaveBalance?.annual || 0}
                        suffix="days"
                    />
                </Card>
            </Col>

            {/* Personal Information */}
            <Col xs={24} lg={12}>
                <Card title="Personal Information" style={{ borderRadius: 12 }}>
                    <Descriptions column={2} size="small">
                        <Descriptions.Item label="Date of Birth">
                            {staff.dateOfBirth ? dayjs(staff.dateOfBirth).format('DD MMM YYYY') : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Gender">
                            {staff.gender?.charAt(0).toUpperCase() + staff.gender?.slice(1)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Blood Group">{staff.bloodGroup || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Nationality">{staff.nationality || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Religion">{staff.religion || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Email">{staff.email}</Descriptions.Item>
                        <Descriptions.Item label="Phone">{staff.phone}</Descriptions.Item>
                    </Descriptions>

                    <Divider style={{ margin: '16px 0' }} />

                    <Title level={5}><HomeOutlined /> Address</Title>
                    <Text>
                        {staff.address?.street}, {staff.address?.city} - {staff.address?.postalCode}
                    </Text>
                </Card>
            </Col>

            {/* Employment Information */}
            <Col xs={24} lg={12}>
                <Card title="Employment Information" style={{ borderRadius: 12 }}>
                    <Descriptions column={2} size="small">
                        <Descriptions.Item label="Employee ID">{staff.employeeId}</Descriptions.Item>
                        <Descriptions.Item label="Department">
                            {staff.department?.charAt(0).toUpperCase() + staff.department?.slice(1)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Designation">{staff.designation}</Descriptions.Item>
                        <Descriptions.Item label="Role">
                            {staff.role?.replace('_', ' ').toUpperCase()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Employment Type">
                            {staff.employmentType?.charAt(0).toUpperCase() + staff.employmentType?.slice(1)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Joining Date">
                            {staff.joiningDate ? dayjs(staff.joiningDate).format('DD MMM YYYY') : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Confirmation Date">
                            {staff.confirmationDate ? dayjs(staff.confirmationDate).format('DD MMM YYYY') : '-'}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            </Col>

            {/* Qualifications */}
            {staff.qualifications && staff.qualifications.length > 0 && (
                <Col xs={24}>
                    <Card title="Qualifications" style={{ borderRadius: 12 }}>
                        <Table
                            columns={[
                                { title: 'Degree', dataIndex: 'degree', key: 'degree' },
                                { title: 'Institution', dataIndex: 'institution', key: 'institution' },
                                { title: 'Year', dataIndex: 'year', key: 'year' },
                                { title: 'Grade', dataIndex: 'grade', key: 'grade' },
                            ]}
                            dataSource={staff.qualifications}
                            pagination={false}
                            rowKey={(record, index) => index}
                        />
                    </Card>
                </Col>
            )}
        </Row>
    );

    const SalaryTab = () => (
        <Card title="Salary Details" style={{ borderRadius: 12 }}>
            <Row gutter={24}>
                <Col xs={24} md={12}>
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Basic Salary">
                            Rs. {(staff.salaryInfo?.basicSalary || 0).toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="House Rent Allowance">
                            Rs. {(staff.salaryInfo?.allowances?.houseRent || 0).toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Transport Allowance">
                            Rs. {(staff.salaryInfo?.allowances?.transport || 0).toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Medical Allowance">
                            Rs. {(staff.salaryInfo?.allowances?.medical || 0).toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Other Allowances">
                            Rs. {(staff.salaryInfo?.allowances?.other || 0).toLocaleString()}
                        </Descriptions.Item>
                    </Descriptions>
                </Col>
                <Col xs={24} md={12}>
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Provident Fund">
                            Rs. {(staff.salaryInfo?.deductions?.providentFund || 0).toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Professional Tax">
                            Rs. {(staff.salaryInfo?.deductions?.professionalTax || 0).toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Other Deductions">
                            Rs. {(staff.salaryInfo?.deductions?.other || 0).toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Total Deductions">
                            Rs. {(staff.salaryInfo?.totalDeductions || 0).toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Net Salary">
                            <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                                Rs. {(staff.salaryInfo?.netSalary || 0).toLocaleString()}
                            </Text>
                        </Descriptions.Item>
                    </Descriptions>
                </Col>
            </Row>

            {staff.bankDetails && (
                <>
                    <Divider />
                    <Title level={5}>Bank Details</Title>
                    <Descriptions column={3}>
                        <Descriptions.Item label="Account Name">{staff.bankDetails.accountName}</Descriptions.Item>
                        <Descriptions.Item label="Account Number">{staff.bankDetails.accountNumber}</Descriptions.Item>
                        <Descriptions.Item label="Bank Name">{staff.bankDetails.bankName}</Descriptions.Item>
                    </Descriptions>
                </>
            )}
        </Card>
    );

    const LeaveTab = () => (
        <Card title="Leave Records" style={{ borderRadius: 12 }}>
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                    <Statistic title="Annual Leave" value={staff.leaveBalance?.annual || 0} suffix="days" />
                </Col>
                <Col span={6}>
                    <Statistic title="Sick Leave" value={staff.leaveBalance?.sick || 0} suffix="days" />
                </Col>
                <Col span={6}>
                    <Statistic title="Casual Leave" value={staff.leaveBalance?.casual || 0} suffix="days" />
                </Col>
                <Col span={6}>
                    <Statistic title="Used" value={staff.leaveBalance?.used || 0} suffix="days" />
                </Col>
            </Row>
            <Table
                columns={[
                    { title: 'Type', dataIndex: 'type', key: 'type', render: (type) => <Tag>{type}</Tag> },
                    { title: 'From', dataIndex: 'startDate', key: 'startDate', render: (date) => dayjs(date).format('DD MMM YYYY') },
                    { title: 'To', dataIndex: 'endDate', key: 'endDate', render: (date) => dayjs(date).format('DD MMM YYYY') },
                    { title: 'Days', dataIndex: 'days', key: 'days' },
                    { title: 'Reason', dataIndex: 'reason', key: 'reason' },
                    {
                        title: 'Status',
                        dataIndex: 'status',
                        key: 'status',
                        render: (status) => (
                            <Tag color={status === 'approved' ? 'green' : status === 'rejected' ? 'red' : 'orange'}>
                                {status?.toUpperCase()}
                            </Tag>
                        )
                    },
                ]}
                dataSource={staff.leaveRecords || []}
                pagination={false}
                rowKey={(record, index) => index}
            />
        </Card>
    );

    const AttendanceTab = () => (
        <Card title="Attendance Summary" style={{ borderRadius: 12 }}>
            <Row gutter={16}>
                <Col span={6}>
                    <Statistic title="Total Days" value={staff.attendanceSummary?.totalDays || 0} />
                </Col>
                <Col span={6}>
                    <Statistic title="Present" value={staff.attendanceSummary?.presentDays || 0} valueStyle={{ color: '#52c41a' }} />
                </Col>
                <Col span={6}>
                    <Statistic title="Absent" value={staff.attendanceSummary?.absentDays || 0} valueStyle={{ color: '#ff4d4f' }} />
                </Col>
                <Col span={6}>
                    <Statistic title="Leave" value={staff.attendanceSummary?.leaveDays || 0} valueStyle={{ color: '#faad14' }} />
                </Col>
            </Row>
        </Card>
    );

    const tabItems = [
        { key: 'overview', label: 'Overview', children: <Overview /> },
        { key: 'salary', label: 'Salary', children: <SalaryTab /> },
        { key: 'leave', label: 'Leave', children: <LeaveTab /> },
        { key: 'attendance', label: 'Attendance', children: <AttendanceTab /> },
    ];

    return (
        <div className="fade-in">
            <PageHeader
                title={`${staff.firstName} ${staff.lastName}`}
                subtitle={`${staff.employeeId} • ${staff.designation}`}
                breadcrumbs={[
                    { title: 'Staff', path: '/staff' },
                    { title: `${staff.firstName} ${staff.lastName}` },
                ]}
                backButton
                actions={
                    <Space>
                        <Button icon={<PrinterOutlined />}>Print Details</Button>
                        <Button type="primary" icon={<EditOutlined />} onClick={() => router.push(`/staff/${staffId}/edit`)}>
                            Edit
                        </Button>
                    </Space>
                }
            />

            {/* Profile Header */}
            <Card style={{ marginBottom: 24, borderRadius: 12 }}>
                <Row gutter={24} align="middle">
                    <Col>
                        <Avatar
                            size={100}
                            style={{ background: staff.gender === 'male' ? '#1890ff' : '#eb2f96' }}
                            icon={<UserOutlined />}
                            src={staff.photo}
                        />
                    </Col>
                    <Col flex="auto">
                        <Space direction="vertical" size={4}>
                            <Space>
                                <Title level={3} style={{ marginBottom: 0 }}>
                                    {staff.firstName} {staff.middleName} {staff.lastName}
                                </Title>
                                <StatusTag status={staff.status} />
                            </Space>
                            <Space split={<Divider type="vertical" />} wrap>
                                <Text type="secondary">ID: {staff.employeeId}</Text>
                                <Text type="secondary">{staff.department?.toUpperCase()}</Text>
                                <Text type="secondary">{staff.designation}</Text>
                                <Text type="secondary">{staff.role?.replace('_', ' ').toUpperCase()}</Text>
                            </Space>
                            <Space size="large" style={{ marginTop: 8 }}>
                                <Text><MailOutlined /> {staff.email}</Text>
                                <Text><PhoneOutlined /> {staff.phone}</Text>
                            </Space>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Tabs */}
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
        </div>
    );
}
