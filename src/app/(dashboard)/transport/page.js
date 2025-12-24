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
  Spin,
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
  ReloadOutlined,
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
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    totalRoutes: 0,
    totalStudents: 0,
    totalDrivers: 0,
    avgCapacity: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch vehicles and summary in parallel
      const [vehiclesRes, summaryRes] = await Promise.all([
        transportApi.getVehicles(),
        transportApi.getDashboard().catch(() => null), // fallback if endpoint doesn't exist
      ]);

      if (vehiclesRes.data.success) {
        const vehicleData = vehiclesRes.data.data || [];
        setVehicles(vehicleData);

        // Extract routes from vehicles
        const allRoutes = [];
        vehicleData.forEach(vehicle => {
          if (vehicle.routes && vehicle.routes.length > 0) {
            vehicle.routes.forEach(route => {
              allRoutes.push({
                ...route,
                _id: route._id || `${vehicle._id}-${route.name}`,
                assignedVehicle: vehicle.vehicleNumber,
                vehicleId: vehicle._id,
              });
            });
          }
        });
        setRoutes(allRoutes);

        // Calculate stats from vehicle data
        const activeCount = vehicleData.filter(v => v.status === 'active' || v.status === 'on-route').length;
        const totalStudents = vehicleData.reduce((sum, v) => sum + (v.assignedStudents?.length || 0), 0);
        const totalCapacity = vehicleData.reduce((sum, v) => sum + (v.capacity || 0), 0);
        const currentOccupancy = vehicleData.reduce((sum, v) => sum + (v.assignedStudents?.length || 0), 0);

        setStats({
          totalVehicles: vehicleData.length,
          activeVehicles: activeCount,
          totalRoutes: allRoutes.length,
          totalStudents: totalStudents,
          totalDrivers: vehicleData.filter(v => v.driver).length,
          avgCapacity: totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0,
        });
      }

      // If summary endpoint works, use its data
      if (summaryRes?.data?.success && summaryRes.data.data) {
        const summary = summaryRes.data.data;
        setStats(prev => ({
          ...prev,
          ...summary,
        }));
      }
    } catch (error) {
      console.error('Error fetching transport data:', error);
      message.error('Failed to fetch transport data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    Modal.confirm({
      title: 'Delete Vehicle',
      content: 'Are you sure you want to delete this vehicle? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await transportApi.deleteVehicle(vehicleId);
          message.success('Vehicle deleted successfully');
          fetchData();
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to delete vehicle');
        }
      },
    });
  };

  const handleViewVehicle = (vehicleId) => {
    router.push(`/transport/vehicles/${vehicleId}`);
  };

  const handleEditVehicle = (vehicleId) => {
    router.push(`/transport/vehicles/${vehicleId}/edit`);
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
          <Text>{record.driver?.name || 'Not Assigned'}</Text>
          {record.driver?.phone && (
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              <PhoneOutlined /> {record.driver.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Routes',
      key: 'routes',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.routes?.length > 0 ? (
            record.routes.slice(0, 2).map((route, idx) => (
              <Tag key={idx} style={{ margin: 2 }}>{route.name}</Tag>
            ))
          ) : (
            <Text type="secondary">No routes</Text>
          )}
          {record.routes?.length > 2 && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              +{record.routes.length - 2} more
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Capacity',
      key: 'capacity',
      render: (_, record) => {
        const occupied = record.assignedStudents?.length || 0;
        const capacity = record.capacity || 0;
        const percent = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
        return (
          <div style={{ width: 100 }}>
            <Progress
              percent={percent}
              size="small"
              format={() => `${occupied}/${capacity}`}
              status={percent > 90 ? 'exception' : 'normal'}
            />
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status] || 'default'}>
          {status?.toUpperCase().replace('-', ' ') || 'UNKNOWN'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View Details',
                onClick: () => handleViewVehicle(record._id),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => handleEditVehicle(record._id),
              },
              {
                key: 'track',
                icon: <EnvironmentOutlined />,
                label: 'Track Location',
                onClick: () => router.push(`/transport/vehicles/${record._id}/track`),
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Delete',
                danger: true,
                onClick: () => handleDeleteVehicle(record._id),
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
          <Text style={{ fontSize: 12 }}>{record.startPoint || 'N/A'}</Text>
          <Text type="secondary">↓</Text>
          <Text style={{ fontSize: 12 }}>{record.endPoint || 'N/A'}</Text>
        </Space>
      ),
    },
    {
      title: 'Details',
      key: 'details',
      render: (_, record) => (
        <Space split="•">
          <span>{record.stops?.length || 0} stops</span>
          <span>{record.distance || 'N/A'}</span>
          <span>{record.estimatedTime || 'N/A'}</span>
        </Space>
      ),
    },
    {
      title: 'Vehicle',
      dataIndex: 'assignedVehicle',
      key: 'vehicle',
      render: (v) => v ? <Tag icon={<CarOutlined />}>{v}</Tag> : <Text type="secondary">Not assigned</Text>,
    },
    {
      title: 'Monthly Fare',
      dataIndex: 'monthlyFare',
      key: 'fare',
      render: (f) => f ? `Rs. ${f.toLocaleString()}` : 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive) => (
        <Tag color={isActive !== false ? 'green' : 'orange'}>
          {isActive !== false ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View Stops',
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit Route',
              },
              {
                key: 'students',
                icon: <TeamOutlined />,
                label: 'View Students',
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
          rowKey="_id"
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
          rowKey="_id"
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
              icon={<ReloadOutlined />}
              onClick={fetchData}
              loading={loading}
            >
              Refresh
            </Button>
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
