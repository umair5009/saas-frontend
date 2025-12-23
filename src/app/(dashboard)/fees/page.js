'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Typography,
  Statistic,
  Table,
  Select,
  Input,
  DatePicker,
  message,
  Tabs,
  List,
} from 'antd';
import {
  DollarOutlined,
  PlusOutlined,
  SearchOutlined,
  DownloadOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  SettingOutlined,
  BankOutlined,
  PercentageOutlined,
  DeploymentUnitOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Form, Modal } from 'antd'; // Add Form, Modal imports
import PageHeader from '@/components/common/PageHeader';
import { feeApi, academicApi, studentApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function FeesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('invoices');
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({});
  const [classes, setClasses] = useState([]);

  // Invoice Generation State
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [feeStructures, setFeeStructures] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch invoices
      const invoiceResponse = await feeApi.getInvoices(filters);
      if (invoiceResponse?.success) {
        setInvoices(invoiceResponse?.data);
      }

      // Fetch payments
      const paymentResponse = await feeApi.getPayments(filters);
      if (paymentResponse?.success) {
        setPayments(paymentResponse?.data);
      }

      // Calculate stats from data
      const allInvoices = invoiceResponse?.data || [];
      const totalAmount = allInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const paidAmount = allInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
      const pendingAmount = allInvoices.reduce((sum, inv) => sum + (inv.balanceAmount || 0), 0);
      const overdueCount = allInvoices.filter(inv => inv.status === 'overdue').length;

      setStats({
        totalAmount,
        collected: paidAmount,
        pending: pendingAmount,
        overdue: overdueCount,
      });
    } catch (error) {
      console.error('Failed to fetch fee data:', error);
      message.error('Failed to fetch fee data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);



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


  useEffect(() => {
    fetchClasses();
  }, []);
  const fetchFeeStructures = async () => {
    try {
      const data = await feeApi.getStructures({ isActive: true });
      if (data.success) {
        setFeeStructures(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch structures", error);
    }
  };

  useEffect(() => {
    if (generateModalVisible) {
      fetchFeeStructures();
      fetchAcademicYears();
    }
  }, [generateModalVisible]);

  const handleGenerateInvoices = async (values) => {
    console.log("clas vales", values.class)
    setGenerateLoading(true);
    try {
      console.log('Generate Invoices Form Values:', values);
      console.log('Fetching students for class:', values.class);
      // Fetch all students in the class (limit 1000 to be safe)
      const studentData = await studentApi.getAll({
        class: values.class,
        limit: 1000,
        // status: 'active' // Removed strict filter for debugging
      });

      console.log('Student data received:', studentData);

      // Check if response has data array
      const students = studentData.success ? (studentData.data || []) : [];
      const studentIds = students.map(s => s._id);

      if (studentIds.length === 0) {
        message.warning(`No active students found in Class ${values.class}`);
        setGenerateLoading(false);
        return;
      }

      console.log(`Generating invoices for ${studentIds.length} students`);

      const response = await feeApi.generateInvoices({
        studentIds,
        feeStructureIds: values.feeStructures,
        dueDate: values.dueDate?.toISOString(),
        academicYear: values.academicYear,
        billingMonth: values.billingMonth?.format('YYYY-MM')
      });

      if (response.success) {
        const { success: successCount, failed: failedCount } = response.data;
        if (failedCount.length > 0) {
          message.warning(`Generated ${successCount.length} invoices, but ${failedCount.length} failed. Check detailed log if needed.`);
          console.warn('Failed invoices:', failedCount);
        } else {
          message.success(`Successfully generated invoices for ${successCount.length} students`);
        }
      }

      setGenerateModalVisible(false);
      form.resetFields();
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Invoice generation error:', error);
      message.error(error.response?.data?.message || 'Failed to generate invoices');
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const invoiceColumns = [
    {
      title: 'Invoice #',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (num) => <Text strong>{num}</Text>,
    },
    {
      title: 'Student',
      key: 'student',
      render: (_, record) => (
        <div>
          <Text>{record.student?.firstName} {record.student?.lastName}</Text>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            {record.student?.admissionNumber} • {record.student?.class}
          </div>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `Rs. ${(amount || 0).toLocaleString()}`,
    },
    {
      title: 'Paid',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (amount) => <Text type="success">Rs. {(amount || 0).toLocaleString()}</Text>,
    },
    {
      title: 'Balance',
      dataIndex: 'balanceAmount',
      key: 'balanceAmount',
      render: (amount) => amount > 0 ? <Text type="danger">Rs. {amount.toLocaleString()}</Text> : '-',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = {
          paid: { color: 'success', icon: <CheckCircleOutlined />, text: 'Paid' },
          partial: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Partial' },
          pending: { color: 'default', icon: <ClockCircleOutlined />, text: 'Pending' },
          overdue: { color: 'error', icon: <ExclamationCircleOutlined />, text: 'Overdue' },
        };
        const { color, icon, text } = config[status] || config.pending;
        return <Tag color={color} icon={icon}>{text}</Tag>;
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
            icon={<EyeOutlined />}
            onClick={() => router.push(`/fees/invoices/${record._id}`)}
          >
            View
          </Button>
          {record.status !== 'paid' && (
            <Button
              type="primary"
              size="small"
              onClick={() => router.push(`/fees/collect?invoice=${record._id}`)}
            >
              Collect
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const paymentColumns = [
    {
      title: 'Receipt #',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
      render: (num) => <Text strong>{num}</Text>,
    },
    {
      title: 'Student',
      key: 'student',
      render: (_, record) => (
        <div>
          <Text>{record.student?.firstName} {record.student?.lastName}</Text>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
            {record.student?.admissionNumber}
          </div>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <Text type="success">Rs. {(amount || 0).toLocaleString()}</Text>,
    },
    {
      title: 'Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => <Tag>{method?.replace('-', ' ').toUpperCase()}</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" size="small" icon={<PrinterOutlined />}>
          Print Receipt
        </Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'invoices',
      label: 'Fee Invoices',
      children: (
        <Table
          columns={invoiceColumns}
          dataSource={invoices}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'payments',
      label: 'Payments',
      children: (
        <Table
          columns={paymentColumns}
          dataSource={payments}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'config',
      label: <Space><SettingOutlined /> Configuration</Space>,
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card hoverable onClick={() => router.push('/fees/structures')}>
              <Space direction="vertical" align="center" style={{ width: '100%', padding: 24 }}>
                <BankOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                <Title level={4}>Fee Structures</Title>
                <Text type="secondary">Define fees, amounts and frequencies</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card hoverable onClick={() => router.push('/fees/scholarships')}>
              <Space direction="vertical" align="center" style={{ width: '100%', padding: 24 }}>
                <DeploymentUnitOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                <Title level={4}>Scholarships</Title>
                <Text type="secondary">Manage merit and need-based scholarships</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card hoverable onClick={() => router.push('/fees/discounts')}>
              <Space direction="vertical" align="center" style={{ width: '100%', padding: 24 }}>
                <PercentageOutlined style={{ fontSize: 48, color: '#722ed1' }} />
                <Title level={4}>Discount Rules</Title>
                <Text type="secondary">Set up auto-discounts and special offers</Text>
              </Space>
            </Card>
          </Col>
        </Row>
      )
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Fee Management"
        subtitle="Manage fee invoices, payments and collections"
        breadcrumbs={[{ title: 'Fees' }]}
        actions={
          <Space>
            <Button
              icon={<FileTextOutlined />}
              onClick={() => router.push('/fees/reports')}
            >
              Reports
            </Button>
            <Button icon={<DownloadOutlined />}>Export</Button>
            <Button
              icon={<FileTextOutlined />}
              onClick={() => setGenerateModalVisible(true)}
            >
              Generate Invoices
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/fees/collect')}
            >
              Collect Fee
            </Button>
          </Space>
        }
      />

      {/* Stats Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Billed"
              value={stats.totalAmount || 0}
              prefix="Rs."
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Collected"
              value={stats.collected || 0}
              prefix="Rs."
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Pending"
              value={stats.pending || 0}
              prefix="Rs."
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Overdue"
              value={stats.overdue || 0}
              suffix="invoices"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Row gutter={16}>
          <Col xs={24} sm={6}>
            <Input
              placeholder="Search student..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleFilterChange('search', e.target.value)}
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
              {classes.map((cls) => (
                <Option key={cls._id} value={cls.name}>{cls.name}</Option>
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
              <Option value="paid">Paid</Option>
              <Option value="partial">Partial</Option>
              <Option value="pending">Pending</Option>
              <Option value="overdue">Overdue</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => handleFilterChange('dateRange', dates)}
            />
          </Col>
          <Col xs={24} sm={4}>
            <Button type="primary" onClick={fetchData}>
              Apply Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tabs */}
      <Card style={{ borderRadius: 12 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      {/* Generate Invoices Modal */}
      <Modal
        title="Generate Fee Invoices"
        open={generateModalVisible}
        onCancel={() => setGenerateModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGenerateInvoices}
        >
          <Form.Item
            name="class"
            label="Select Class"
            rules={[{ required: true, message: 'Class is required' }]}
          >
            <Select placeholder="Select Class">
              {classes.map(c => (
                <Option key={c._id} value={c._id}>{c.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="academicYear"
            label="Academic Year"
            rules={[{ required: true, message: 'Academic Year is required' }]}
          >
            <Select placeholder="Select Academic Year">
              {academicYears.map(y => (
                <Option key={y._id} value={y.year}>{y.name} ({y.year})</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="feeStructures"
            label="Fee Structures"
            rules={[{ required: true, message: 'Select at least one fee' }]}
          >
            <Select mode="multiple" placeholder="Select Fees (e.g. Tuition)">
              {feeStructures.map(fs => (
                <Option key={fs._id} value={fs._id}>{fs.name} - {fs.amount}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="billingMonth"
            label="Billing Month"
            rules={[{ required: true, message: 'Billing Month is required' }]}
            initialValue={dayjs()}
          >
            <DatePicker picker="month" format="MMMM YYYY" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: 'Due Date is required' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setGenerateModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={generateLoading}>
              Generate
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
