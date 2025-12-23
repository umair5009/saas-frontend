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
  InputNumber,
  Select,
  message,
  Modal,
  Divider,
  Typography,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { feeApi, academicApi, branchApi } from '@/lib/api';
import useAuthStore from '@/store/authStore';

const { Option } = Select;
const { Title, Text } = Typography;

export default function FeeStructurePage() {
  const router = useRouter();
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [branches, setBranches] = useState([]);
  const { user } = useAuthStore();
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFeeStructures();
    fetchClasses();
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (user && !user.branch) {
      fetchBranches();
    }
  }, [user]);

  const fetchFeeStructures = async () => {
    setLoading(true);
    try {
      const data = await feeApi.getStructures();
      if (data.success) {
        setFeeStructures(data.data);
      }
    } catch (error) {
      message.error('Failed to fetch fee structures');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await academicApi.getClasses();
      if (data.success) {
        setClasses(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const data = await academicApi.getAcademicYears();
      if (data.success) {
        setAcademicYears(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch academic years:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const data = await branchApi.getAll();
      if (data.success) {
        setBranches(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  const handleSubmit = async (values) => {
    const payload = { ...values };
    if (user?.branch) {
      payload.branch = user.branch._id || user.branch;
    }

    try {
      if (editingStructure) {
        await feeApi.updateStructure(editingStructure._id, payload);
        message.success('Fee structure updated successfully');
      } else {
        await feeApi.createStructure(payload);
        message.success('Fee structure created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingStructure(null);
      fetchFeeStructures();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to save fee structure');
    }
  };

  const handleEdit = (record) => {
    setEditingStructure(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await feeApi.deleteStructure(id);
      message.success('Fee structure deleted successfully');
      fetchFeeStructures();
    } catch (error) {
      message.error('Failed to delete fee structure');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Class',
      dataIndex: 'class',
      key: 'class',
      render: (cls) => <Tag color="blue">{cls}</Tag>,
    },
    {
      title: 'Fee Type',
      dataIndex: 'feeType',
      key: 'feeType',
      render: (type) => {
        const colors = {
          tuition: 'green',
          admission: 'purple',
          exam: 'orange',
          transport: 'blue',
          library: 'cyan',
          activity: 'pink',
        };
        return <Tag color={colors[type] || 'default'}>{type?.replace('_', ' ')}</Tag>;
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `Rs. ${amount?.toLocaleString()}`,
    },
    {
      title: 'Frequency',
      dataIndex: 'frequency',
      key: 'frequency',
      render: (freq) => freq?.replace('_', ' '),
    },
    {
      title: 'Academic Year',
      dataIndex: 'academicYear',
      key: 'academicYear',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Fee Structure Management"
        subtitle="Define and manage fee structures for different classes and fee types"
        breadcrumbs={[
          { title: 'Fees', path: '/fees' },
          { title: 'Structure' },
        ]}
        backButton
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingStructure(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Add Fee Structure
          </Button>
        }
      />

      {/* Fee Structures Table */}
      <Card style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={feeStructures}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingStructure ? 'Edit Fee Structure' : 'Add Fee Structure'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingStructure(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            frequency: 'monthly',
            feeType: 'tuition',
          }}
        >
          <Row gutter={16}>

            <Col span={24}>
              <Form.Item
                name="name"
                label="Fee Name"
                rules={[{ required: true, message: 'Please enter fee name' }]}
              >
                <Input placeholder="e.g. Monthly Tuition Fee 2025" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="class"
                label="Class"
                rules={[{ required: true, message: 'Please select class' }]}
              >
                <Select placeholder="Select Class">
                  {classes.map((cls) => (
                    <Option key={cls._id} value={cls.name}>{cls.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="feeType"
                label="Fee Type"
                rules={[{ required: true, message: 'Please select fee type' }]}
              >
                <Select placeholder="Select Fee Type">
                  <Option value="tuition">Tuition Fee</Option>
                  <Option value="admission">Admission Fee</Option>
                  <Option value="exam">Exam Fee</Option>
                  <Option value="lab">Lab Fee</Option>
                  <Option value="library">Library Fee</Option>
                  <Option value="transport">Transport Fee</Option>
                  <Option value="hostel">Hostel Fee</Option>
                  <Option value="sports">Sports Fee</Option>
                  <Option value="computer">Computer Fee</Option>
                  <Option value="miscellaneous">Miscellaneous</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input placeholder="Brief description of the fee" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Amount"
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                  min={0}
                  placeholder="Enter amount"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="frequency"
                label="Frequency"
                rules={[{ required: true, message: 'Please select frequency' }]}
              >
                <Select placeholder="Select Frequency">
                  <Option value="one-time">One Time</Option>
                  <Option value="monthly">Monthly</Option>
                  <Option value="quarterly">Quarterly</Option>
                  <Option value="half-yearly">Half Yearly</Option>
                  <Option value="yearly">Yearly</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="academicYear"
                label="Academic Year"
                rules={[{ required: true, message: 'Please select academic year' }]}
              >
                <Select placeholder="Select Academic Year">
                  {academicYears.map((year) => (
                    <Option key={year._id} value={year.year}>{year.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dueDay"
                label="Due Day (Monthly)"
                tooltip="Day of the month when payment is due (1-31)"
              >
                <InputNumber min={1} max={31} style={{ width: '100%' }} placeholder="e.g. 10" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Additional Notes">
            <Input.TextArea rows={3} placeholder="Any additional notes or conditions" />
          </Form.Item>

          <Divider />

          <Space style={{ width: '100%', justifyContent: 'end' }}>
            <Button onClick={() => {
              setModalVisible(false);
              setEditingStructure(null);
              form.resetFields();
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingStructure ? 'Update' : 'Create'} Fee Structure
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
