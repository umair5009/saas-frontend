'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Row,
  Col,
  Typography,
  Descriptions,
  Tag,
  Space,
  Button,
  Table,
  Divider,
  Spin,
  message,
  Progress,
  Statistic,
  Avatar,
} from 'antd';
import {
  PrinterOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { feeApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusConfig = {
  paid: { color: 'success', icon: <CheckCircleOutlined />, text: 'Paid' },
  partial: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Partial Payment' },
  pending: { color: 'default', icon: <ClockCircleOutlined />, text: 'Pending' },
  overdue: { color: 'error', icon: <ExclamationCircleOutlined />, text: 'Overdue' },
};

export default function InvoiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id;

  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (invoiceId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invoiceRes, paymentsRes] = await Promise.all([
        feeApi.getInvoiceById(invoiceId),
        feeApi.getPayments({ invoiceId: invoiceId })
      ]);
      console.log(invoiceRes, paymentsRes)
      if (invoiceRes?.success) {
        setInvoice(invoiceRes?.data);
      }
      if (paymentsRes?.success) {
        setPayments(paymentsRes?.data);
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch invoice details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <Card>
        <Text>Invoice not found</Text>
        <Button onClick={() => router.back()}>Back</Button>
      </Card>
    );
  }

  const statusInfo = statusConfig[invoice.status] || statusConfig.pending;

  const paymentColumns = [
    {
      title: 'Date',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `Rs. ${amount?.toLocaleString()}`,
    },
    {
      title: 'Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => <Tag>{method?.replace('-', ' ').toUpperCase()}</Tag>,
    },
    {
      title: 'Receipt Number',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
      render: (receiptNumber) => <Tag>{receiptNumber?.replace('-', ' ')}</Tag>,

    },
    {
      title: 'Received By',
      dataIndex: 'collectedBy',
      key: 'collectedBy',
      render: (user) => user?.name || (typeof user === 'string' ? 'System' : 'System'),
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title={`Invoice #${invoice.invoiceNumber}`}
        subtitle={`Student: ${invoice.student?.firstName} ${invoice.student?.lastName}`}
        breadcrumbs={[
          { title: 'Fees', path: '/fees' },
          { title: 'Invoices', path: '/fees' },
          { title: invoice.invoiceNumber },
        ]}
        backButton
        actions={
          <Space>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
              Print Invoice
            </Button>
            <Button icon={<DownloadOutlined />}>
              Download PDF
            </Button>
          </Space>
        }
      />

      {/* Invoice Header */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={24} align="middle">
          <Col>
            <Avatar
              size={64}
              style={{
                background: statusInfo.color === 'success' ? '#52c41a' :
                  statusInfo.color === 'warning' ? '#faad14' :
                    statusInfo.color === 'error' ? '#ff4d4f' : '#1890ff'
              }}
              icon={<DollarOutlined />}
            />
          </Col>
          <Col flex="auto">
            <Space direction="vertical" size={4}>
              <Space>
                <Title level={3} style={{ marginBottom: 0 }}>
                  Invoice #{invoice.invoiceNumber}
                </Title>
                <Tag color={statusInfo.color} icon={statusInfo.icon}>
                  {statusInfo.text}
                </Tag>
              </Space>
              <Space split={<Divider type="vertical" />} wrap>
                <Text type="secondary">
                  <CalendarOutlined /> Due: {dayjs(invoice.dueDate).format('DD MMM YYYY')}
                </Text>
                <Text type="secondary">
                  Period: {invoice.period ? `${invoice.period.month}/${invoice.period.year}` : 'N/A'}
                </Text>
                <Text type="secondary">
                  Academic Year: {invoice.academicYear}
                </Text>
              </Space>
            </Space>
          </Col>
          <Col>
            <div style={{ textAlign: 'right' }}>
              <Statistic
                title="Total Amount"
                value={invoice.totalAmount || 0}
                prefix="Rs."
                valueStyle={{ fontSize: 24 }}
              />
              <Text type="secondary">
                Paid: Rs. {(invoice.paidAmount || 0).toLocaleString()}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Student Information */}
        <Col xs={24} lg={12}>
          <Card title="Student Information" style={{ borderRadius: 12 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Name">
                {invoice.student?.firstName} {invoice.student?.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="Admission Number">
                {invoice.student?.admissionNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Class">
                {invoice.student?.class} - {invoice.student?.section}
              </Descriptions.Item>
              <Descriptions.Item label="Roll Number">
                {invoice.student?.rollNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {invoice.student?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {invoice.student?.phone}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Fee Details */}
        <Col xs={24} lg={12}>
          <Card title="Fee Details" style={{ borderRadius: 12 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Fee Type">
                <Tag color="blue">
                  {invoice.items && invoice.items.length > 0
                    ? invoice.items.map(item => item.feeType?.replace('_', ' ')).join(', ') || 'Tuition'
                    : 'Tuition'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {invoice.items && invoice.items.length > 0
                  ? invoice.items.map(item => item.feeName).join(', ')
                  : (invoice.description || 'N/A')}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                Rs. {(invoice.totalAmount || 0).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Paid Amount">
                <Text type="success">Rs. {(invoice.paidAmount || 0).toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Balance">
                <Text type={invoice.balanceAmount > 0 ? 'danger' : 'success'}>
                  Rs. {(invoice.balanceAmount || 0).toLocaleString()}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Discount">
                {invoice.discounts && invoice.discounts.length > 0
                  ? `Rs. ${(invoice.totalDiscount || 0).toLocaleString()}`
                  : 'None'}
              </Descriptions.Item>
              <Descriptions.Item label="Late Fee">
                Rs. {(invoice.lateFee?.amount || 0).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Period">
                {invoice.period ? `${invoice.period.month}/${invoice.period.year}` : 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            {/* Payment Progress */}
            <Divider />
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={Math.round(((invoice.paidAmount || 0) / (invoice.totalAmount || 1)) * 100)}
                format={(percent) => `${percent}% Paid`}
                strokeColor={statusInfo.color === 'success' ? '#52c41a' : '#1890ff'}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Payment History */}
      <Card title="Payment History" style={{ marginTop: 24, borderRadius: 12 }}>
        <Table
          columns={paymentColumns}
          dataSource={payments}
          rowKey="_id"
          pagination={false}
          locale={{ emptyText: 'No payments recorded yet' }}
        />
        {(payments.length === 0) && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text type="secondary">No payments have been made for this invoice yet.</Text>
          </div>
        )}
      </Card>

      {/* Actions */}
      <Card style={{ marginTop: 24, borderRadius: 12 }}>
        <Space>
          <Button onClick={() => router.back()}>Back to Invoices</Button>
          {invoice.status !== 'paid' && (
            <Button
              type="primary"
              onClick={() => router.push(`/fees/collect?invoice=${invoiceId}`)}
            >
              Collect Payment
            </Button>
          )}
          <Button icon={<PrinterOutlined />}>Print Receipt</Button>
        </Space>
      </Card>
    </div>
  );
}
