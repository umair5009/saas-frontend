'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Typography,
  Table,
  Tag,
  Space,
  Avatar,
  Input,
  Button,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  LoginOutlined,
  LogoutOutlined,
  SettingOutlined,
  DollarOutlined,
  BookOutlined,
  DownloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const actionConfig = {
  CREATE: { icon: <PlusOutlined />, color: '#52c41a' },
  UPDATE: { icon: <EditOutlined />, color: '#1890ff' },
  DELETE: { icon: <DeleteOutlined />, color: '#ff4d4f' },
  VIEW: { icon: <EyeOutlined />, color: '#8c8c8c' },
  LOGIN: { icon: <LoginOutlined />, color: '#13c2c2' },
  LOGOUT: { icon: <LogoutOutlined />, color: '#faad14' },
  PAYMENT: { icon: <DollarOutlined />, color: '#52c41a' },
  SETTINGS: { icon: <SettingOutlined />, color: '#722ed1' },
  MARKS_ENTRY: { icon: <BookOutlined />, color: '#eb2f96' },
};

const moduleColors = {
  Auth: 'cyan',
  Student: 'blue',
  Staff: 'green',
  Fee: 'gold',
  Exam: 'purple',
  Attendance: 'orange',
  Library: 'magenta',
  Settings: 'red',
  Branch: 'geekblue',
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [filters, dateRange]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockLogs = [
        {
          _id: '1',
          user: { name: 'Admin User', email: 'admin@school.com', role: 'super_admin' },
          action: 'CREATE',
          module: 'Student',
          description: 'Created new student: Ali Khan (STU202500125)',
          targetModel: 'Student',
          targetId: 'student-125',
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome 120 on Windows',
          createdAt: dayjs().subtract(10, 'minutes').toISOString(),
        },
        {
          _id: '2',
          user: { name: 'Branch Admin', email: 'branch@school.com', role: 'branch_admin' },
          action: 'PAYMENT',
          module: 'Fee',
          description: 'Collected fee payment: Rs. 15,000 from Ahmed Hassan',
          targetModel: 'FeePayment',
          targetId: 'payment-456',
          ipAddress: '192.168.1.101',
          userAgent: 'Chrome 120 on Windows',
          createdAt: dayjs().subtract(30, 'minutes').toISOString(),
        },
        {
          _id: '3',
          user: { name: 'Teacher', email: 'teacher@school.com', role: 'teacher' },
          action: 'MARKS_ENTRY',
          module: 'Exam',
          description: 'Entered marks for Mathematics - Class 10A (45 students)',
          targetModel: 'Exam',
          targetId: 'exam-789',
          ipAddress: '192.168.1.102',
          userAgent: 'Firefox 121 on macOS',
          createdAt: dayjs().subtract(2, 'hours').toISOString(),
        },
        {
          _id: '4',
          user: { name: 'Admin User', email: 'admin@school.com', role: 'super_admin' },
          action: 'UPDATE',
          module: 'Settings',
          description: 'Updated fee structure for academic year 2025-2026',
          targetModel: 'Settings',
          targetId: 'settings-1',
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome 120 on Windows',
          createdAt: dayjs().subtract(1, 'day').toISOString(),
        },
        {
          _id: '5',
          user: { name: 'System', email: 'system', role: 'system' },
          action: 'CREATE',
          module: 'Fee',
          description: 'Auto-generated 125 fee invoices for January 2025',
          targetModel: 'FeeInvoice',
          targetId: 'batch-001',
          ipAddress: 'localhost',
          userAgent: 'System Job',
          createdAt: dayjs().subtract(2, 'days').toISOString(),
        },
        {
          _id: '6',
          user: { name: 'Branch Admin', email: 'branch@school.com', role: 'branch_admin' },
          action: 'DELETE',
          module: 'Student',
          description: 'Deleted student record: Inactive student (withdrawn)',
          targetModel: 'Student',
          targetId: 'student-old',
          ipAddress: '192.168.1.101',
          userAgent: 'Chrome 120 on Windows',
          createdAt: dayjs().subtract(3, 'days').toISOString(),
        },
      ];

      setLogs(mockLogs);
    } catch (error) {
      console.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(date).format('DD MMM YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(date).format('hh:mm:ss A')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'User',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar
            size="small"
            icon={<UserOutlined />}
            style={{
              background: record.user.role === 'super_admin' ? '#722ed1' :
                         record.user.role === 'branch_admin' ? '#1890ff' :
                         record.user.role === 'teacher' ? '#52c41a' : '#8c8c8c',
            }}
          />
          <div>
            <Text>{record.user.name}</Text>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>
              {record.user.role?.replace('_', ' ')}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (action) => {
        const config = actionConfig[action] || { icon: null, color: '#8c8c8c' };
        return (
          <Tag
            icon={config.icon}
            color={config.color}
            style={{ borderRadius: 4 }}
          >
            {action}
          </Tag>
        );
      },
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      width: 100,
      render: (module) => (
        <Tag color={moduleColors[module] || 'default'}>{module}</Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 130,
      render: (ip) => <Text code style={{ fontSize: 12 }}>{ip}</Text>,
    },
    {
      title: 'Device',
      dataIndex: 'userAgent',
      key: 'userAgent',
      width: 180,
      ellipsis: true,
      render: (ua) => <Text type="secondary" style={{ fontSize: 12 }}>{ua}</Text>,
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Activity Logs"
        subtitle="Track all user activities and system events"
        breadcrumbs={[{ title: 'Activity Logs' }]}
        actions={
          <Button icon={<DownloadOutlined />}>Export Logs</Button>
        }
      />

      {/* Filters */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by Action"
              allowClear
              style={{ width: '100%' }}
              onChange={(v) => setFilters((f) => ({ ...f, action: v }))}
            >
              {Object.keys(actionConfig).map((action) => (
                <Option key={action} value={action}>{action}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by Module"
              allowClear
              style={{ width: '100%' }}
              onChange={(v) => setFilters((f) => ({ ...f, module: v }))}
            >
              {Object.keys(moduleColors).map((module) => (
                <Option key={module} value={module}>{module}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by User"
              allowClear
              style={{ width: '100%' }}
              onChange={(v) => setFilters((f) => ({ ...f, user: v }))}
            >
              <Option value="admin">Admin Users</Option>
              <Option value="staff">Staff</Option>
              <Option value="teacher">Teachers</Option>
              <Option value="system">System</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={setDateRange}
            />
          </Col>
        </Row>
      </Card>

      {/* Logs Table */}
      <DataTable
        columns={columns}
        dataSource={logs}
        loading={loading}
        onRefresh={fetchLogs}
        searchPlaceholder="Search in activity logs..."
        showExport
        scroll={{ x: 1200 }}
      />
    </div>
  );
}

