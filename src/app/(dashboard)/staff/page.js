'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Space,
  Tag,
  Avatar,
  Dropdown,
  message,
  Typography,
  Input,
  Select,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  DownloadOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { staffApi } from '@/lib/api';

const { Text } = Typography;
const { Option } = Select;

const roleColors = {
  teacher: 'blue',
  admin_staff: 'purple',
  accountant: 'green',
  librarian: 'orange',
  lab_assistant: 'cyan',
};

export default function StaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({});
  const [stats, setStats] = useState({});

  const fetchStaff = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        page: params.page || pagination.current,
        limit: params.limit || pagination.pageSize,
        ...filters,
        ...params,
      };

      const response = await staffApi.getAll(queryParams);
      if (response.success) {
        setStaff(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || response.length,
          current: response.pagination?.page || 1,
        }));

        const data = response.data;
        setStats({
          total: response.pagination?.total || data.length,
          teachers: data.filter(s => s.role === 'teacher').length,
          active: data.filter(s => s.status === 'active').length,
          departments: [...new Set(data.map(s => s.department))].length,
        });
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      message.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters]);

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleTableChange = (newPagination) => {
    fetchStaff({
      page: newPagination.current,
      limit: newPagination.pageSize,
    });
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    fetchStaff({ search: value, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    fetchStaff({ [key]: value, page: 1 });
  };

  const handleDelete = async (id) => {
    try {
      await staffApi.delete(id);
      message.success('Staff member deleted successfully');
      fetchStaff();
    } catch (error) {
      message.error('Failed to delete staff member');
    }
  };

  const columns = [
    {
      title: 'Staff Member',
      key: 'staff',
      width: 280,
      render: (_, record) => (
        <Space>
          <Avatar
            size={45}
            style={{ background: record.gender === 'male' ? '#1890ff' : '#eb2f96' }}
            icon={<UserOutlined />}
            src={record.photo}
          />
          <div>
            <Text strong>{record.firstName} {record.lastName}</Text>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {record.employeeId}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={roleColors[role] || 'default'}>
          {role?.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => dept?.charAt(0).toUpperCase() + dept?.slice(1),
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}><PhoneOutlined /> {record.phone || '-'}</Text>
          <Text style={{ fontSize: 12 }} type="secondary">
            <MailOutlined /> {record.email ? record.email.split('@')[0] + '...' : '-'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : status === 'on_leave' ? 'orange' : 'red'}>
          {status?.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View Details',
                onClick: () => router.push(`/staff/${record._id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => router.push(`/staff/${record._id}/edit`),
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Delete',
                danger: true,
                onClick: () => handleDelete(record._id),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Staff Management"
        subtitle="Manage teachers and other staff members"
        breadcrumbs={[{ title: 'Staff' }]}
        actions={
          <Space>
            <Button icon={<DownloadOutlined />}>Export</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/staff/create')}
            >
              Add Staff
            </Button>
          </Space>
        }
      />

      {/* Stats Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Staff"
              value={stats.total || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Teachers"
              value={stats.teachers || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Active"
              value={stats.active || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Departments"
              value={stats.departments || 0}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Input
              placeholder="Search by name, employee ID..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Role"
              allowClear
              style={{ width: '100%' }}
              onChange={(v) => handleFilterChange('role', v)}
            >
              <Option value="teacher">Teacher</Option>
              <Option value="admin_staff">Admin Staff</Option>
              <Option value="accountant">Accountant</Option>
              <Option value="librarian">Librarian</Option>
              <Option value="lab_assistant">Lab Assistant</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Department"
              allowClear
              style={{ width: '100%' }}
              onChange={(v) => handleFilterChange('department', v)}
            >
              <Option value="academic">Academic</Option>
              <Option value="administration">Administration</Option>
              <Option value="accounts">Accounts</Option>
              <Option value="library">Library</Option>
              <Option value="sports">Sports</Option>
              <Option value="it">IT</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Status"
              allowClear
              style={{ width: '100%' }}
              onChange={(v) => handleFilterChange('status', v)}
            >
              <Option value="active">Active</Option>
              <Option value="on_leave">On Leave</Option>
              <Option value="terminated">Terminated</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        dataSource={staff}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        onRefresh={fetchStaff}
        rowKey="_id"
      />
    </div>
  );
}
