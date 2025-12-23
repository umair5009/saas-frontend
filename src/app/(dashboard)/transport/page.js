'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Tabs,
  Typography,
  Statistic,
  Table,
  Avatar,
  Progress,
  Dropdown,
  Modal,
  Form,
  Input,
  Select,
  message,
} from 'antd';
import {
  PlusOutlined,
  CarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  TeamOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { transportApi } from '@/lib/api';

const { Title, Text } = Typography;
const { Option } = Select;

const statusColors = {
  active: 'green',
  inactive: 'orange',
  maintenance: 'red',
  'on-route': 'blue',
};

export default function TransportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('vehicles');
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [routeModal, setRouteModal] = useState({ open: false, route: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock data
      setStats({
        totalVehicles: 12,
        activeVehicles: 10,
        totalRoutes: 8,
        totalStudents: 450,
        totalDrivers: 12,
        avgCapacity: 78,
      });

      const mockVehicles = [
        {
          _id: '1',
          vehicleNumber: 'LHR-1234',
          type: 'bus',
          model: 'Toyota Coaster',
          capacity: 40,
          currentOccupancy: 35,
          driver: { name: 'Ahmed Khan', phone: '03001234567' },
          route: 'Route A - DHA',
          status: 'active',
          lastMaintenance: '2025-01-01',
        },
        {
          _id: '2',
          vehicleNumber: 'LHR-5678',
          type: 'van',
          model: 'Hiace',
          capacity: 15,
          currentOccupancy: 12,
          driver: { name: 'Ali Hassan', phone: '03009876543' },
          route: 'Route B - Model Town',
          status: 'on-route',
          lastMaintenance: '2025-01-10',
        },
        {
          _id: '3',
          vehicleNumber: 'LHR-9012',
          type: 'bus',
          model: 'Yutong',
          capacity: 50,
          currentOccupancy: 0,
          driver: { name: 'Usman Ali', phone: '03005555555' },
          route: 'Route C - Johar Town',
          status: 'maintenance',
          lastMaintenance: '2024-12-15',
        },
      ];

      const mockRoutes = [
        {
          _id: '1',
          name: 'Route A - DHA',
          startPoint: 'School Main Campus',
          endPoint: 'DHA Phase 6',
          stops: 8,
          distance: '15 km',
          duration: '45 min',
          assignedVehicle: 'LHR-1234',
          students: 35,
          fare: 3000,
          status: 'active',
        },
        {
          _id: '2',
          name: 'Route B - Model Town',
          startPoint: 'School Main Campus',
          endPoint: 'Model Town Link Road',
          stops: 6,
          distance: '12 km',
          duration: '35 min',
          assignedVehicle: 'LHR-5678',
          students: 28,
          fare: 2500,
          status: 'active',
        },
        {
          _id: '3',
          name: 'Route C - Johar Town',
          startPoint: 'School Main Campus',
          endPoint: 'Johar Town G Block',
          stops: 10,
          distance: '18 km',
          duration: '50 min',
          assignedVehicle: 'LHR-9012',
          students: 42,
          fare: 3500,
          status: 'inactive',
        },
      ];

      setVehicles(mockVehicles);
      setRoutes(mockRoutes);
    } catch (error) {
      message.error('Failed to fetch transport data');
    } finally {
      setLoading(false);
    }
  };

  const vehicleColumns = [
    {
      title: 'Vehicle',
      key: 'vehicle',
      render: (_, record) => (
        <Space>
          <Avatar
            size={48}
            style={{ background: record.type === 'bus' ? '#1890ff15' : '#52c41a15' }}
            icon={<CarOutlined style={{ color: record.type === 'bus' ? '#1890ff' : '#52c41a' }} />}
          />
          <div>
            <Text strong>{record.vehicleNumber}</Text>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {record.model} ({record.type})
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Driver',
      key: 'driver',
      render: (_, record) => (
        <div>
          <Text>{record.driver?.name}</Text>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            <PhoneOutlined /> {record.driver?.phone}
          </div>
        </div>
      ),
    },
    {
      title: 'Route',
      dataIndex: 'route',
      key: 'route',
    },
    {
      title: 'Capacity',
      key: 'capacity',
      render: (_, record) => (
        <div style={{ width: 100 }}>
          <Progress
            percent={Math.round((record.currentOccupancy / record.capacity) * 100)}
            size="small"
            format={() => `${record.currentOccupancy}/${record.capacity}`}
          />
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]}>{status?.toUpperCase().replace('-', ' ')}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: 'View Details' },
              { key: 'edit', icon: <EditOutlined />, label: 'Edit' },
              { key: 'track', icon: <EnvironmentOutlined />, label: 'Track Location' },
              { type: 'divider' },
              { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const routeColumns = [
    {
      title: 'Route Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Journey',
      key: 'journey',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>{record.startPoint}</Text>
          <Text type="secondary">↓</Text>
          <Text style={{ fontSize: 12 }}>{record.endPoint}</Text>
        </Space>
      ),
    },
    {
      title: 'Details',
      key: 'details',
      render: (_, record) => (
        <Space split="•">
          <span>{record.stops} stops</span>
          <span>{record.distance}</span>
          <span>{record.duration}</span>
        </Space>
      ),
    },
    {
      title: 'Vehicle',
      dataIndex: 'assignedVehicle',
      key: 'vehicle',
      render: (v) => <Tag icon={<CarOutlined />}>{v}</Tag>,
    },
    {
      title: 'Students',
      dataIndex: 'students',
      key: 'students',
      render: (s) => <Tag icon={<TeamOutlined />}>{s}</Tag>,
    },
    {
      title: 'Monthly Fare',
      dataIndex: 'fare',
      key: 'fare',
      render: (f) => `Rs. ${f.toLocaleString()}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>{status?.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: 'View Stops' },
              { key: 'edit', icon: <EditOutlined />, label: 'Edit Route' },
              { key: 'students', icon: <TeamOutlined />, label: 'View Students' },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'vehicles',
      label: <><CarOutlined /> Vehicles</>,
      children: (
        <DataTable
          columns={vehicleColumns}
          dataSource={vehicles}
          loading={loading}
          onRefresh={fetchData}
          searchPlaceholder="Search by vehicle number, driver..."
        />
      ),
    },
    {
      key: 'routes',
      label: <><EnvironmentOutlined /> Routes</>,
      children: (
        <DataTable
          columns={routeColumns}
          dataSource={routes}
          loading={loading}
          onRefresh={fetchData}
          searchPlaceholder="Search routes..."
        />
      ),
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Transport Management"
        subtitle="Manage vehicles, routes, and student assignments"
        breadcrumbs={[{ title: 'Transport' }]}
        actions={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/transport/vehicles/create')}
            >
              Add Vehicle
            </Button>
            <Button
              icon={<PlusOutlined />}
              onClick={() => router.push('/transport/routes/create')}
            >
              Add Route
            </Button>
          </Space>
        }
      />

      {/* Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} md={4}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Vehicles"
              value={stats.totalVehicles}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Active"
              value={stats.activeVehicles}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Routes"
              value={stats.totalRoutes}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Students"
              value={stats.totalStudents}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Drivers"
              value={stats.totalDrivers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Avg Capacity"
              value={stats.avgCapacity}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card style={{ borderRadius: 12 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
    </div>
  );
}

