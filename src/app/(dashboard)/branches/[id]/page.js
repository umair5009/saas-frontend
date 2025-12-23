'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Typography,
  Tabs,
  Avatar,
  Statistic,
  Descriptions,
  List,
  Modal,
  Form,
  Select,
  Input,
  message,
  Divider,
} from 'antd';
import {
  EditOutlined,
  BankOutlined,
  UserOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ArrowLeftOutlined,
  SwapOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  DollarOutlined
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { branchApi, staffApi } from '@/lib/api';

const { Title, Text } = Typography;

export default function BranchDetailsPage({ params }) {
  const router = useRouter();
  // Unwrap params using React.use for Next.js 15+
  const resolvedParams = use(params);
  const branchId = resolvedParams.id;

  const [branch, setBranch] = useState(null);
  const [childBranches, setChildBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modal States
  const [transferModal, setTransferModal] = useState(false);
  const [principalModal, setPrincipalModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [branchesList, setBranchesList] = useState([]);

  useEffect(() => {
    fetchBranchDetails();
  }, [branchId]);

  const fetchBranchDetails = async () => {
    setLoading(true);
    try {
      // Use correct API methods: getById and getChildren
      const [branchRes, childrenRes] = await Promise.all([
        branchApi.getById(branchId),
        branchApi.getChildren(branchId)
      ]);

      setBranch(branchRes.data);
      setChildBranches(childrenRes.data || []);
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch branch details');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        studentIds: values.studentIds.split(',').map(s => s.trim())
      };
      await branchApi.transferStudents(branchId, payload);
      message.success('Students transferred successfully');
      setTransferModal(false);
      fetchBranchDetails();
    } catch (error) {
      message.error('Failed to transfer students: ' + (error.response?.data?.message || error.message));
    }
  };

  const handlePrincipalSubmit = async (values) => {
    try {
      await branchApi.assignPrincipal(branchId, values);
      message.success('Principal assigned successfully');
      setPrincipalModal(false);
      fetchBranchDetails();
    } catch (error) {
      message.error('Failed to assign principal');
    }
  };

  const openPrincipalModal = async () => {
    try {
      const res = await staffApi.getAll({ branch: branchId });
      setStaffList(res.data || []);
      setPrincipalModal(true);
    } catch (err) {
      message.info("Could not fetch staff list automatically.");
      setPrincipalModal(true);
    }
  };

  const openTransferModal = async () => {
    try {
      const res = await branchApi.getAll();
      setBranchesList(res.data.filter(b => b._id !== branchId) || []);
      setTransferModal(true);
    } catch (err) {
      message.error("Could not fetch target branches");
    }
  };

  if (loading) return <Card loading />;
  if (!branch) return <Card>Branch not found</Card>;

  return (
    <div className="fade-in">
      <PageHeader
        title={branch.name}
        subtitle={branch.code}
        breadcrumbs={[
          { title: 'Branches', href: '/branches' },
          { title: branch.name },
        ]}
        actions={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/branches')}
            >
              Back
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => router.push(`/branches/${branchId}/edit`)}
            >
              Edit Branch
            </Button>
            <Button
              icon={<SettingOutlined />}
              onClick={() => router.push(`/branches/${branchId}/settings`)}
            >
              Settings
            </Button>
          </Space>
        }
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="Branch Information">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar
                    size={80}
                    icon={<BankOutlined />}
                    style={{ backgroundColor: branch.type === 'main' ? '#722ed1' : '#1890ff', marginBottom: 16 }}
                  />
                  <Title level={4}>{branch.name}</Title>
                  <Tag color={branch.type === 'main' ? 'purple' : 'blue'}>{branch.type.toUpperCase()}</Tag>
                  <Tag color={branch.status === 'active' ? 'green' : 'red'}>{branch.status.toUpperCase()}</Tag>
                </div>
                <Divider />
                <Descriptions column={1} size="small">
                  <Descriptions.Item label={<Space><EnvironmentOutlined /> Address</Space>}>
                    {branch.address?.street}, {branch.address?.city}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Space><PhoneOutlined /> Phone</Space>}>
                    {branch.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Space><MailOutlined /> Email</Space>}>
                    {branch.email}
                  </Descriptions.Item>
                </Descriptions>
              </Space>
            </Card>

            <Card title="Principal / Head" extra={<Button size="small" onClick={openPrincipalModal}>Change</Button>}>
              {branch.principal?.name ? (
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={branch.principal.name}
                  description={branch.principal.email}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Text type="secondary">No principal assigned</Text>
                  <br />
                  <Button type="link" onClick={openPrincipalModal}>Assign Now</Button>
                </div>
              )}
            </Card>
          </Space>
        </Col>

        <Col xs={24} lg={16}>
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'overview',
                  label: 'Statistics',
                  children: (
                    <Row gutter={[16, 16]}>
                      {/* Network Statistics (for Main Branch / Super Admin) */}
                      {branch.networkStatistics && (
                        <>
                          <Col span={24}>
                            <Divider orientation="left">Network Totals (Main + Child Branches)</Divider>
                          </Col>
                          <Col span={8}>
                            <Card type="inner" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
                              <Statistic title={<span style={{ color: '#fff' }}>Network Students</span>} value={branch.networkStatistics?.totalStudents} valueStyle={{ color: '#fff' }} prefix={<UserOutlined />} />
                            </Card>
                          </Col>
                          <Col span={8}>
                            <Card type="inner" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: '#fff' }}>
                              <Statistic title={<span style={{ color: '#fff' }}>Network Staff</span>} value={branch.networkStatistics?.totalStaff} valueStyle={{ color: '#fff' }} prefix={<TeamOutlined />} />
                            </Card>
                          </Col>
                          <Col span={8}>
                            <Card type="inner" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#fff' }}>
                              <Statistic title={<span style={{ color: '#fff' }}>Child Branches</span>} value={branch.networkStatistics?.childBranchCount} valueStyle={{ color: '#fff' }} prefix={<BankOutlined />} />
                            </Card>
                          </Col>
                        </>
                      )}

                      {/* Direct Branch Statistics */}
                      <Col span={24}>
                        <Divider orientation="left">This Branch Only</Divider>
                      </Col>
                      <Col span={12}>
                        <Card type="inner">
                          <Statistic title="Total Students" value={branch.statistics?.totalStudents} prefix={<UserOutlined />} />
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card type="inner">
                          <Statistic title="Total Staff" value={branch.statistics?.totalStaff} prefix={<TeamOutlined />} />
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card type="inner">
                          <Statistic title="Active Students" value={branch.statistics?.activeStudents} valueStyle={{ color: '#3f8600' }} />
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card type="inner">
                          <Statistic title="Fee Collection" value={branch.metrics?.feeCollectionRate} suffix="%" prefix={<DollarOutlined />} />
                        </Card>
                      </Col>

                      <Col span={24}>
                        <Divider orientation="left">Quick Actions</Divider>
                        <Space wrap>
                          <Button icon={<SwapOutlined />} onClick={openTransferModal}>Transfer Students</Button>
                          <Button icon={<SafetyCertificateOutlined />}>View Audit Logs</Button>
                        </Space>
                      </Col>
                    </Row>
                  )
                },
                {
                  key: 'hierarchy',
                  label: `Hierarchy (${childBranches.length})`,
                  children: (
                    <>
                      {childBranches.length > 0 ? (
                        <List
                          itemLayout="horizontal"
                          dataSource={childBranches}
                          renderItem={(item) => (
                            <List.Item actions={[<Button type="link" onClick={() => router.push(`/branches/${item._id}`)}>View</Button>]}>
                              <List.Item.Meta
                                avatar={<Avatar icon={<BankOutlined />} style={{ backgroundColor: '#87d068' }} />}
                                title={item.name}
                                description={`${item.address?.city} • ${item.statistics?.totalStudents || 0} Students`}
                              />
                            </List.Item>
                          )}
                        />
                      ) : (
                        <div style={{ textAlign: 'center', padding: 20 }}>
                          <Text type="secondary">No child branches found.</Text>
                        </div>
                      )}
                    </>
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Assign Principal"
        open={principalModal}
        onCancel={() => setPrincipalModal(false)}
        footer={null}
      >
        <Form onFinish={handlePrincipalSubmit} layout="vertical">
          <Form.Item name="staffId" label="Select Staff Member" rules={[{ required: true }]}>
            <Select
              placeholder="Select a staff member"
              showSearch
              optionFilterProp="label"
              options={staffList.map(s => ({ label: `${s.fullName} (${s.employeeId || s.email})`, value: s._id }))}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Assign Principal</Button>
        </Form>
      </Modal>

      <Modal
        title="Transfer Students"
        open={transferModal}
        onCancel={() => setTransferModal(false)}
        footer={null}
      >
        <Form onFinish={handleTransferSubmit} layout="vertical">
          <Form.Item name="targetBranchId" label="Transfer To (Destination Branch)" rules={[{ required: true }]}>
            <Select placeholder="Select Target Branch"
              options={branchesList.map(b => ({ label: b.name, value: b._id }))}
            />
          </Form.Item>

          <Form.Item name="studentIds" label="Student IDs (Comma separated)" rules={[{ required: true }]} help="Enter IDs separated by commas (e.g. 64f..., 64e...)">
            <Input.TextArea rows={3} placeholder="Paste Student IDs here..." />
          </Form.Item>

          <Form.Item name="reason" label="Reason for Transfer">
            <Input placeholder="e.g. Family relocation" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>Initiate Transfer</Button>
        </Form>
      </Modal>

    </div>
  );
}