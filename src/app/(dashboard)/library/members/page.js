'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Table,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Modal,
  Divider,
  Typography,
  Tag,
  Avatar,
  Statistic,
  Progress,
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { libraryApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export default function LibraryMembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [memberType, setMemberType] = useState('all');

  useEffect(() => {
    fetchMembers();
  }, [searchText, memberType]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (searchText) filters.search = searchText;
      if (memberType !== 'all') filters.type = memberType;

      const data = await libraryApi.getMembers(filters);
      if (data.success) {
        setMembers(data.data);
      }
    } catch (error) {
      message.error('Failed to fetch library members');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Member',
      key: 'member',
      render: (_, record) => (
        <Space>
          <Avatar
            style={{
              background: record.type === 'student' ? '#1890ff' : '#52c41a',
            }}
            icon={<UserOutlined />}
          />
          <div>
            <Text strong>
              {record.firstName} {record.lastName}
            </Text>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {record.type === 'student' ? `Class ${record.class} - ${record.section}` : record.designation}
            </div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>
              ID: {record.admissionNumber || record.employeeId}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'student' ? 'blue' : 'green'}>
          {type?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Books Issued',
      dataIndex: 'booksIssued',
      key: 'booksIssued',
      render: (count) => (
        <Space>
          <BookOutlined />
          <Text>{count || 0}</Text>
        </Space>
      ),
    },
    {
      title: 'Overdue Books',
      dataIndex: 'overdueBooks',
      key: 'overdueBooks',
      render: (count) => (
        <Text type={count > 0 ? 'danger' : 'secondary'}>
          {count || 0}
        </Text>
      ),
    },
    {
      title: 'Total Fine',
      dataIndex: 'totalFine',
      key: 'totalFine',
      render: (fine) => (
        <Text type={fine > 0 ? 'danger' : 'secondary'}>
          Rs. {fine || 0}
        </Text>
      ),
    },
    {
      title: 'Membership Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          active: 'success',
          suspended: 'error',
          expired: 'warning',
        };
        return <Tag color={colors[status] || 'default'}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => router.push(`/library/members/${record._id}?type=${record.type}`)}
          >
            View Details
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => router.push(`/library?member=${record._id}&type=${record.type}&action=issue`)}
          >
            Issue Book
          </Button>
        </Space>
      ),
    },
  ];

  const handleCollectFine = (member) => {
    if (member.totalFine > 0) {
      Modal.confirm({
        title: 'Collect Fine',
        content: `Collect Rs. ${member.totalFine} from ${member.firstName} ${member.lastName}?`,
        onOk: async () => {
          try {
            await libraryApi.collectFine(member._id, member.totalFine);
            message.success('Fine collected successfully');
            fetchMembers();
          } catch (error) {
            message.error('Failed to collect fine');
          }
        },
      });
    } else {
      // Navigate to issue book page
      router.push(`/library/issue?memberId=${member._id}`);
    }
  };

  // Calculate stats
  const stats = {
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'active').length,
    students: members.filter(m => m.type === 'student').length,
    staff: members.filter(m => m.type === 'staff').length,
    totalBooksIssued: members.reduce((sum, m) => sum + (m.booksIssued || 0), 0),
    overdueBooks: members.reduce((sum, m) => sum + (m.overdueBooks || 0), 0),
    totalFines: members.reduce((sum, m) => sum + (m.totalFine || 0), 0),
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Library Members"
        subtitle="Manage library membership and track member activities"
        breadcrumbs={[
          { title: 'Library', path: '/library' },
          { title: 'Members' },
        ]}
        backButton
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/library/members/register')}
          >
            Register Member
          </Button>
        }
      />

      {/* Stats Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Members"
              value={stats.totalMembers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Active Members"
              value={stats.activeMembers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Books Issued"
              value={stats.totalBooksIssued}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Pending Fines"
              value={stats.totalFines}
              prefix="Rs."
              valueStyle={{ color: stats.totalFines > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search by name, ID..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Member Type"
              value={memberType}
              onChange={setMemberType}
              style={{ width: '100%' }}
            >
              <Option value="all">All Members</Option>
              <Option value="student">Students</Option>
              <Option value="staff">Staff</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button type="primary" onClick={fetchMembers}>
              Search
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Members Table */}
      <Card style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={members}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Member Type Distribution */}
      <Card style={{ marginTop: 24, borderRadius: 12 }}>
        <Title level={4}>Member Distribution</Title>
        <Row gutter={24}>
          <Col span={12}>
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Progress
                type="circle"
                percent={stats.totalMembers > 0 ? (stats.students / stats.totalMembers) * 100 : 0}
                format={(percent) => `${stats.students} Students`}
                strokeColor="#1890ff"
              />
            </div>
          </Col>
          <Col span={12}>
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Progress
                type="circle"
                percent={stats.totalMembers > 0 ? (stats.staff / stats.totalMembers) * 100 : 0}
                format={(percent) => `${stats.staff} Staff`}
                strokeColor="#52c41a"
              />
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}