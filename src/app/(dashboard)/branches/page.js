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
  Dropdown,
  Modal,
  message,
  Typography,
  Avatar,
  Statistic,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  BankOutlined,
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { branchApi } from '@/lib/api';
import { useAuthStore } from '@/store';

const { Title, Text } = Typography;

const statusColors = {
  active: 'green',
  inactive: 'orange',
  suspended: 'red',
};

export default function BranchesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [deleteModal, setDeleteModal] = useState({ open: false, branch: null });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await branchApi.getAll();
      setBranches(response?.data || []);
    } catch (error) {
      message.error('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await branchApi.delete(deleteModal.branch._id);
      message.success('Branch deleted successfully');
      setDeleteModal({ open: false, branch: null });
      fetchBranches();
    } catch (error) {
      message.error('Failed to delete branch');
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Branch',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Avatar
            style={{
              background: record.type === 'main' ? '#722ed1' : '#1890ff',
            }}
            icon={<BankOutlined />}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.code}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => (
        <Space>
          <EnvironmentOutlined />
          {record.address?.city}
        </Space>
      ),
    },
    {
      title: 'Students',
      dataIndex: ['statistics', 'totalStudents'],
      key: 'students',
    },
    {
      title: 'Staff',
      dataIndex: ['statistics', 'totalStaff'],
      key: 'staff',
    },
    {
      title: 'Fee Collection',
      key: 'feeRate',
      render: (_, record) => (
        <Progress
          percent={record.metrics?.feeCollectionRate || 0}
          size="small"
          status={record.metrics?.feeCollectionRate >= 90 ? 'success' : 'normal'}
        />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]}>{status?.toUpperCase()}</Tag>
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
                onClick: () => router.push(`/branches/${record._id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => router.push(`/branches/${record._id}/edit`),
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Delete',
                danger: true,
                onClick: () => setDeleteModal({ open: true, branch: record }),
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

  // Branch Card Component
  const BranchCard = ({ branch }) => (
    <Card
      hoverable
      style={{ borderRadius: 12, height: '100%' }}
      actions={[
        <Button key="view" type="link" onClick={() => router.push(`/branches/${branch._id}`)}>
          View Details
        </Button>,
        <Dropdown
          key="more"
          menu={{
            items: [
              { key: 'edit', icon: <EditOutlined />, label: 'Edit' },
              { key: 'settings', label: 'Settings' },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Space align="start">
          <Avatar
            size={48}
            style={{
              background: branch.type === 'main'
                ? 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)'
                : 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
            }}
            icon={<BankOutlined />}
          />
          <div>
            <Title level={5} style={{ marginBottom: 0 }}>{branch.name}</Title>
            <Space size="small" wrap>
              <Tag color={branch.type === 'main' ? 'purple' : 'blue'}>{branch.type}</Tag>
              <Tag color={statusColors[branch.status]}>{branch.status}</Tag>
              {/* Show Child Branch Count if available (Super Admin View) */}
              {branch.childBranchCount !== undefined && (
                <Tag color="cyan">{branch.childBranchCount} Campuses</Tag>
              )}
            </Space>
          </div>
        </Space>
      </div>

      <Space direction="vertical" size="small" style={{ width: '100%', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <EnvironmentOutlined style={{ color: '#8c8c8c' }} />
          <Text type="secondary">{branch.address?.street}, {branch.address?.city}</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PhoneOutlined style={{ color: '#8c8c8c' }} />
          <Text type="secondary">{branch.phone}</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MailOutlined style={{ color: '#8c8c8c' }} />
          <Text type="secondary">{branch.email}</Text>
        </div>
      </Space>

      <Row gutter={[8, 8]}>
        <Col span={8}>
          <div style={{ textAlign: 'center', padding: 8, borderRadius: 6 }}>
            <UserOutlined style={{ color: '#1890ff', marginBottom: 4 }} />
            <div style={{ fontWeight: 600 }}>{branch.statistics?.totalStudents}</div>
            <Text type="secondary" style={{ fontSize: 10 }}>Students</Text>
          </div>
        </Col>

        {/* Conditional Display: Show Network Total for Main Branches (when data exists) */}
        {branch.totalNetworkStudents !== undefined ? (
          <Col span={8}>
            <div style={{ textAlign: 'center', padding: 8, borderRadius: 6 }}>
              <TeamOutlined style={{ color: '#eb2f96', marginBottom: 4 }} />
              <div style={{ fontWeight: 600 }}>{branch.totalNetworkStudents}</div>
              <Text type="secondary" style={{ fontSize: 10 }}>Total Network</Text>
            </div>
          </Col>
        ) : (
          <Col span={8}>
            <div style={{ textAlign: 'center', padding: 8, borderRadius: 6 }}>
              <TeamOutlined style={{ color: '#52c41a', marginBottom: 4 }} />
              <div style={{ fontWeight: 600 }}>{branch.statistics?.totalStaff}</div>
              <Text type="secondary" style={{ fontSize: 10 }}>Staff</Text>
            </div>
          </Col>
        )}

        <Col span={8}>
          <div style={{ textAlign: 'center', padding: 8, borderRadius: 6 }}>
            <DollarOutlined style={{ color: '#fa8c16', marginBottom: 4 }} />
            <div style={{ fontWeight: 600 }}>{branch.metrics?.feeCollectionRate}%</div>
            <Text type="secondary" style={{ fontSize: 10 }}>Collection</Text>
          </div>
        </Col>
      </Row>
    </Card >
  );

  return (
    <div className="fade-in">
      <PageHeader
        title="Branch Management"
        subtitle="Manage all branches of your school"
        breadcrumbs={[{ title: 'Branches' }]}
        actions={
          <Space>
            <Button.Group>
              <Button
                type={viewMode === 'card' ? 'primary' : 'default'}
                onClick={() => setViewMode('card')}
              >
                Cards
              </Button>
              <Button
                type={viewMode === 'table' ? 'primary' : 'default'}
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </Button.Group>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/branches/create')}
            >
              Add Branch
            </Button>
          </Space>
        }
      />

      {/* Summary Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Branches"
              value={branches.length}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Students"
              value={branches.reduce((sum, b) => sum + (b.statistics?.totalStudents || 0), 0)}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Staff"
              value={branches.reduce((sum, b) => sum + (b.statistics?.totalStaff || 0), 0)}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Branch List */}
      {viewMode === 'card' ? (
        <Row gutter={[24, 24]}>
          {loading ? (
            Array(3).fill(null).map((_, i) => (
              <Col xs={24} md={12} lg={8} key={i}>
                <Card loading style={{ borderRadius: 12 }} />
              </Col>
            ))
          ) : (
            branches.map((branch) => (
              <Col xs={24} md={12} lg={8} key={branch._id}>
                <BranchCard branch={branch} />
              </Col>
            ))
          )}
        </Row>
      ) : (
        <DataTable
          columns={columns}
          dataSource={branches}
          loading={loading}
          onRefresh={fetchBranches}
        />
      )}

      {/* Delete Modal */}
      <Modal
        title="Delete Branch"
        open={deleteModal.open}
        onOk={handleDelete}
        onCancel={() => setDeleteModal({ open: false, branch: null })}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete <strong>{deleteModal.branch?.name}</strong>?
          This will remove all associated data.
        </p>
      </Modal>
    </div>
  );
}

