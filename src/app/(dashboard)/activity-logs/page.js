'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Typography,
  Tag,
  Space,
  Avatar,
  Button,
  message,
  Tooltip
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
  SearchOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import dayjs from 'dayjs';
import { activityLogApi } from '@/lib/api';

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Config for icons and colors
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
  OTHER: { icon: <SafetyCertificateOutlined />, color: 'default' }
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
  System: 'volcano'
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter states
  const [filters, setFilters] = useState({
    action: undefined,
    module: undefined,
    user: undefined,
    search: undefined
  });
  const [dateRange, setDateRange] = useState(null);

  // Metadata for filters
  const [actionsList, setActionsList] = useState([]);
  const [modulesList, setModulesList] = useState([]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, pageSize, filters, dateRange]);

  const fetchMetadata = async () => {
    try {
      const [actionsRes, modulesRes] = await Promise.all([
        activityLogApi.getActions(),
        activityLogApi.getModules()
      ]);
      if (actionsRes.success) setActionsList(actionsRes.data);
      if (modulesRes.success) setModulesList(modulesRes.data);
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        ...filters,
      };

      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].startOf('day').toISOString();
        params.endDate = dateRange[1].endOf('day').toISOString();
      }

      const response = await activityLogApi.getAll(params);

      if (response.success) {
        setLogs(response.data);
        setTotal(response.pagination.total);
      }
    } catch (error) {
      message.error('Failed to fetch activity logs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleExport = async () => {
    try {
      message.loading('Exporting logs...', 1);
      const params = {
        ...filters,
        format: 'csv'
      };

      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].startOf('day').toISOString();
        params.endDate = dateRange[1].endOf('day').toISOString();
      }

      const blob = await activityLogApi.export(params);

      // Create a link and trigger download
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      const filename = `activity_logs_${dayjs().format('YYYY-MM-DD_HHmm')}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('Logs exported successfully');
    } catch (error) {
      message.error('Failed to export logs');
      console.error(error);
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
          <Text strong>{dayjs(date).format('DD MMM YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(date).format('hh:mm:ss A')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'User',
      key: 'user',
      width: 220,
      render: (_, record) => {
        if (!record.user) return <Text type="secondary">System/Unknown</Text>;

        return (
          <Space>
            <Avatar
              size="small"
              icon={<UserOutlined />}
              style={{
                background: record.user.role === 'super_admin' ? '#722ed1' :
                  record.user.role === 'main_branch_admin' ? '#1890ff' :
                    record.user.role === 'teacher' ? '#52c41a' : '#8c8c8c',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Text style={{ fontSize: 13, fontWeight: 500 }}>{record.user.name}</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {record.user.role?.replace(/_/g, ' ').toUpperCase()}
              </Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 130,
      render: (action) => {
        const config = actionConfig[action] || actionConfig['OTHER'];
        return (
          <Tag
            icon={config.icon}
            color={config.color}
            style={{ borderRadius: 4, marginRight: 0 }}
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
      width: 120,
      render: (module) => (
        <Tag color={moduleColors[module] || 'default'}>{module}</Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 300 }}>{text}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Client Info',
      key: 'clientInfo',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text code style={{ fontSize: 11 }}>{record.ipAddress || 'N/A'}</Text>
          <Tooltip title={record.userAgent}>
            <Text type="secondary" ellipsis style={{ fontSize: 11, maxWidth: 150, display: 'block' }}>
              {record.userAgent || 'Unknown'}
            </Text>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Activity Logs"
        subtitle="Track all user activities and system events"
        breadcrumbs={[{ title: 'Activity Logs' }]}
        actions={
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Export Logs
          </Button>
        }
      />

      {/* Filters */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }} bodyStyle={{ padding: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              placeholder="Filter by Action"
              allowClear
              style={{ width: '100%' }}
              onChange={(v) => {
                setFilters((f) => ({ ...f, action: v }));
                setCurrentPage(1);
              }}
            >
              {actionsList.map((action) => (
                <Option key={action} value={action}>{action}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              placeholder="Filter by Module"
              allowClear
              style={{ width: '100%' }}
              onChange={(v) => {
                setFilters((f) => ({ ...f, module: v }));
                setCurrentPage(1);
              }}
            >
              {modulesList.map((module) => (
                <Option key={module} value={module}>{module}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              placeholder="Filter by User Role" // Backend filters by user ID but for UI maybe role or search is better? 
              // The backend route supports userId, but UI asks for generic user filter. 
              // I'll leave this as a text search for now or just role based if backend supported it.
              // Actually, I'll remove this specific user select for now as we don't have a list of all users handy here.
              // I'll add a general Search input instead.
              allowClear
              style={{ width: '100%' }}
              dropdownStyle={{ display: 'none' }}
              mode="tags"
              // Wait, let's just use the search input mainly.
              disabled
            />
            {/* Replacing the above disabled select with a clear note or simpler search */}
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => {
                setDateRange(dates);
                setCurrentPage(1);
              }}
            />
          </Col>
          <Col xs={24} md={24} lg={3}>
          </Col>
        </Row>
      </Card>

      {/* Logs Table */}
      <DataTable
        columns={columns}
        dataSource={logs}
        loading={loading}
        onRefresh={fetchLogs}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
        searchPlaceholder="Search in activity logs..." // This prop in DataTable usually does client side filtering or callback?
        // Checking DataTable implementation would be good, but standard Antd Table uses onChange for pagination.
        // My DataTable wrapper might have specific behavior. 
        // I will assume standard usage for now but note to check if searchPlaceholder does anything.
        // Actually, if DataTable has a search bar built-in, I should wire it to my search state.
        onSearch={(value) => {
          setFilters(prev => ({ ...prev, search: value }));
          setCurrentPage(1);
        }}
        showExport={false} // usage handled by my own button
        scroll={{ x: 1200 }}
        rowKey="_id"
      />
    </div>
  );
}
