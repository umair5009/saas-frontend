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
import { studentApi, academicApi } from '@/lib/api';

const { Text } = Typography;
const { Option } = Select;

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({});
  const [stats, setStats] = useState({});
  const [classes, setClasses] = useState([]);

  const fetchStudents = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        page: params.page || pagination.current,
        limit: params.limit || pagination.pageSize,
        ...filters,
        ...params,
      };

      const response = await studentApi.getAll(queryParams);


      setStudents(response.data);
      if (response.success == true) {
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || response.data.length,
          current: response.pagination?.page || 1,
        }));

        // Calculate stats from data
        const data = response.data;
        setStats({
          total: response.pagination?.total || data.length,
          active: data.filter(s => s.status === 'active').length,
          male: data.filter(s => s.gender === 'male').length,
          female: data.filter(s => s.gender === 'female').length,
        });
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      message.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters]);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data } = await academicApi.getClasses();
      if (data.success) {
        setClasses(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const handleTableChange = (newPagination, tableFilters, sorter) => {
    fetchStudents({
      page: newPagination.current,
      limit: newPagination.pageSize,
    });
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    fetchStudents({ search: value, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    fetchStudents({ [key]: value, page: 1 });
  };

  const handleDelete = async (id) => {
    try {
      await studentApi.delete(id);
      message.success('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      message.error('Failed to delete student');
    }
  };

  const columns = [
    {
      title: 'Student',
      key: 'student',
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
              {record.admissionNumber}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Class',
      key: 'class',
      render: (_, record) => (
        <Tag color="blue">{record.class} - {record.section}</Tag>
      ),
    },
    {
      title: 'Roll No.',
      dataIndex: 'rollNumber',
      key: 'rollNumber',
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
      title: 'Guardian',
      key: 'guardian',
      render: (_, record) => {
        const primary = record.guardians?.find(g => g.isPrimary) || record.guardians?.[0];
        return primary ? (
          <div>
            <Text>{primary.firstName} {primary.lastName}</Text>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>
              {primary.type} • {primary.phone}
            </div>
          </div>
        ) : '-';
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : status === 'inactive' ? 'orange' : 'red'}>
          {status?.toUpperCase()}
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
                onClick: () => router.push(`/students/${record._id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => router.push(`/students/${record._id}/edit`),
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
        title="Students"
        subtitle="Manage student registrations and records"
        breadcrumbs={[{ title: 'Students' }]}
        actions={
          <Space>
            <Button icon={<DownloadOutlined />}>Export</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/students/create')}
            >
              Add Student
            </Button>
          </Space>
        }
      />

      {/* Stats Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Students"
              value={stats.total || 0}
              prefix={<TeamOutlined />}
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
              title="Male"
              value={stats.male || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Female"
              value={stats.female || 0}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Input
              placeholder="Search by name, admission number..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Class"
              allowClear
              style={{ width: '100%' }}
              onChange={(v) => handleFilterChange('class', v)}
            >
              {classes.map(cls => (
                <Option key={cls._id} value={cls._id}>{cls.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Section"
              allowClear
              style={{ width: '100%' }}
              onChange={(v) => handleFilterChange('section', v)}
            >
              {['A', 'B', 'C', 'D'].map(s => (
                <Option key={s} value={s}>Section {s}</Option>
              ))}
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
              <Option value="inactive">Inactive</Option>
              <Option value="withdrawn">Withdrawn</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select
              placeholder="Gender"
              allowClear
              style={{ width: '100%' }}
              onChange={(v) => handleFilterChange('gender', v)}
            >
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        dataSource={students}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        onRefresh={fetchStudents}
        rowKey="_id"
      />
    </div>
  );
}
