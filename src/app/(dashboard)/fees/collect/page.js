'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Divider,
  Typography,
  message,
  Modal,
  Result,
  DatePicker,
  Radio,
  Spin
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  DollarOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { feeApi, studentApi } from '@/lib/api';

const { Title, Text } = Typography;
const { Option } = Select;

export default function CollectFeePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const [searchLoading, setSearchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [student, setStudent] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  // Initialize from query params
  useEffect(() => {
    const studentId = searchParams.get('studentId');
    const invoiceId = searchParams.get('invoice'); // 'invoice' matches what's sent from fees page

    if (studentId) {
      fetchStudentById(studentId);
    } else if (invoiceId) {
      // If invoice ID is provided, fetch invoice to get student ID
      fetchInvoiceDetail(invoiceId);
    }
  }, [searchParams]);

  const fetchStudentById = async (id) => {
    setSearchLoading(true);
    try {
      const response = await studentApi.getById(id);
      if (response?.success) {
        const studentData = response.data;
        setStudent(studentData);
        fetchStudentInvoices(studentData._id);
      } else {
        message.warning('Student not found');
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch student details');
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchInvoiceDetail = async (id) => {
    setSearchLoading(true);
    try {
      const response = await feeApi.getInvoiceById(id);
      if (response?.success) {
        const invoice = response.data;
        // Verify student exists and set student
        if (invoice.student) {
          // Check if invoice.student is object or ID (depends on populate)
          const studentId = typeof invoice.student === 'object' ? invoice.student._id : invoice.student;

          // Fetch full student details
          await fetchStudentById(studentId);

          // Auto-select this invoice
          setSelectedInvoices([id]);
        }
      } else {
        message.warning('Invoice not found');
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to load invoice details');
    } finally {
      setSearchLoading(false);
    }
  };

  // Search student
  const handleSearchStudent = async (value) => {
    if (!value || value.length < 3) return;

    setSearchLoading(true);
    setStudent(null);
    setInvoices([]);
    setSelectedInvoices([]);

    try {
      // Use regex search if possible, or exact match depending on API
      // Here we assume studentApi.getAll supports a general 'search' query
      const response = await studentApi.getAll({ search: value, limit: 1 });

      if (response?.success && response?.data?.length > 0) {
        const studentData = response.data[0];
        setStudent(studentData);
        fetchStudentInvoices(studentData._id);
      } else {
        message.info('Student not found');
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to search student');
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchStudentInvoices = async (studentId) => {
    try {
      const response = await feeApi.getInvoices({
        studentId,
        status: ['pending', 'partial', 'overdue']
      });

      if (response?.success) {
        // Add unique keys for Table
        const invoiceData = response.data.map(inv => ({
          ...inv,
          key: inv._id
        }));
        setInvoices(invoiceData);
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch pending invoices');
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return selectedInvoices.reduce((sum, key) => {
      const invoice = invoices.find((i) => i.key === key);
      return sum + (invoice?.balanceAmount || 0) + (invoice?.lateFee?.amount || 0);
    }, 0);
  };

  // Handle payment
  const handlePaymentSubmit = async (values) => {
    if (selectedInvoices.length === 0) {
      message.warning('Please select at least one invoice');
      return;
    }

    setSubmitLoading(true);
    const receipts = [];
    const errors = [];

    try {
      // If multiple invoices, we must pay them individually
      // If single invoice, we use the input amount (allows partial)
      // If multiple, we force full payment for each (disabled input)

      for (const invoiceId of selectedInvoices) {
        const invoice = invoices.find(i => i.key === invoiceId);
        if (!invoice) continue;

        // Determine amount for this specific invoice
        let payAmount = 0;
        if (selectedInvoices.length === 1) {
          payAmount = values.amount; // Use the input amount for single selection
        } else {
          payAmount = (invoice.balanceAmount || 0) + (invoice.lateFee || 0); // Force full amount
        }

        const payload = {
          invoiceId: invoiceId,
          amount: payAmount,
          paymentMethod: values.paymentMethod,
          notes: values.notes,
          // ... other payment details
        };

        // Add method specific details
        if (values.paymentMethod === 'cheque') {
          payload.paymentDetails = {
            chequeNumber: values.chequeNumber,
            chequeDate: values.chequeDate?.toISOString(),
            bankName: values.bankName
          };
        } else if (values.paymentMethod === 'bank-transfer') {
          payload.paymentDetails = {
            transactionId: values.transactionId
          };
        }

        try {
          const response = await feeApi.collectPayment(payload);
          if (response?.success) {
            receipts.push(response.data.receiptNumber);
          }
        } catch (err) {
          console.error(`Failed to pay invoice ${invoice.invoiceNumber}`, err);
          errors.push(invoice.invoiceNumber);
        }
      }

      if (receipts.length > 0) {
        setPaymentSuccess({
          receiptNumber: receipts.join(', '), // Show all receipts
          amount: values.amount,
          method: values.paymentMethod,
          date: new Date().toISOString(),
        });
        message.success(`Collected payment successfully. Receipts: ${receipts.join(', ')}`);
      }

      if (errors.length > 0) {
        message.error(`Failed to collect for: ${errors.join(', ')}`);
      }

    } catch (error) {
      console.error(error);
      message.error('Payment processing failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Invoice columns
  const invoiceColumns = [
    {
      title: 'Invoice #',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
    },
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      render: (period) => period ? `${period.month}/${period.year}` : '-',
    },
    {
      title: 'Fee Type',
      dataIndex: 'feeType',
      key: 'feeType',
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `Rs. ${amount.toLocaleString()}`,
    },
    {
      title: 'Paid',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (amount) => `Rs. ${amount.toLocaleString()}`,
    },
    {
      title: 'Balance',
      dataIndex: 'balanceAmount',
      key: 'balanceAmount',
      render: (amount) => (
        <Text strong style={{ color: '#ff4d4f' }}>
          Rs. {amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Late Fee',
      dataIndex: 'lateFee',
      key: 'lateFee',
      render: (fee) => (fee > 0 ? `Rs. ${fee}` : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'pending' ? 'orange' : status === 'partial' ? 'blue' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  // Payment success modal
  if (paymentSuccess) {
    return (
      <div className="fade-in">
        <Card style={{ maxWidth: 600, margin: '0 auto', borderRadius: 12, textAlign: 'center' }}>
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: 72 }} />}
            title="Payment Successful!"
            subTitle={
              <Space direction="vertical" size="small">
                <Text>Receipt Number: <strong>{paymentSuccess.receiptNumber}</strong></Text>
                <Text>Amount: <strong>Rs. {paymentSuccess.amount?.toLocaleString()}</strong></Text>
                <Text>Payment Method: <strong>{paymentSuccess.method}</strong></Text>
              </Space>
            }
            extra={[
              <Button
                key="print"
                type="primary"
                icon={<PrinterOutlined />}
                onClick={() => window.print()}
              >
                Print Receipt
              </Button>,
              <Button key="new" onClick={() => {
                setPaymentSuccess(null);
                setStudent(null);
                setInvoices([]);
                setSelectedInvoices([]);
                form.resetFields();
              }}>
                New Payment
              </Button>,
              <Button key="dashboard" onClick={() => router.push('/fees')}>
                Back to Dashboard
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Collect Fee"
        subtitle="Search student and collect fee payment"
        breadcrumbs={[
          { title: 'Fees', path: '/fees' },
          { title: 'Collect Fee' },
        ]}
        backButton
      />

      {/* Search Student */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Space.Compact style={{ width: '100%', maxWidth: 500 }}>
          <Input
            placeholder="Search by admission number, name, or phone..."
            size="large"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={() => handleSearchStudent(searchValue)}
          />
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            loading={searchLoading}
            onClick={() => handleSearchStudent(searchValue)}
          >
            Search Student
          </Button>
        </Space.Compact>
      </Card>

      {/* Student Info & Invoices */}
      {student && (
        <>
          {/* Student Info */}
          <Card style={{ marginBottom: 24, borderRadius: 12 }}>
            <Row gutter={24} align="middle">
              <Col>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 12,
                    background: '#e6f7ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UserOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                </div>
              </Col>
              <Col flex="auto">
                <Title level={4} style={{ marginBottom: 4 }}>
                  {student.firstName} {student.lastName}
                </Title>
                <Space split={<Divider type="vertical" />}>
                  <Text type="secondary">Admission: {student.admissionNumber}</Text>
                  <Text type="secondary">{student.class} - {student.section}</Text>
                  <Text type="secondary">
                    Guardian: {student.guardian?.firstName} {student.guardian?.lastName}
                  </Text>
                </Space>
                <div style={{ marginTop: 8 }}>
                  <Space>
                    {student.feeDetails?.scholarship && (
                      <Tag color="gold">
                        Scholarship: {student.feeDetails.scholarship.name}
                      </Tag>
                    )}
                    {student.feeDetails?.discounts?.map(d => (
                      <Tag key={d._id} color="purple">Discount: {d.name}</Tag>
                    ))}
                  </Space>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Pending Invoices */}
          <Card
            title="Pending Invoices"
            style={{ marginBottom: 24, borderRadius: 12 }}
          >
            <Table
              columns={invoiceColumns}
              dataSource={invoices}
              pagination={false}
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys: selectedInvoices,
                onChange: (keys) => setSelectedInvoices(keys),
              }}
            />
          </Card>

          {/* Payment Form */}
          {selectedInvoices.length > 0 && (
            <Card title="Payment Details" style={{ borderRadius: 12 }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handlePaymentSubmit}
                initialValues={{ paymentMethod: 'cash' }}
                onValuesChange={(_, allValues) => {
                  // Trigger re-render for balance calculation
                  form.setFieldsValue(allValues);
                }}
              >
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="amount"
                      label="Amount to Pay"
                      rules={[{ required: true }]}
                      help={selectedInvoices.length > 1 ? "Amount locked for multiple invoices" : null}
                    >
                      <InputNumber
                        size="large"
                        style={{ width: '100%' }}
                        formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                        min={1}
                        disabled={selectedInvoices.length > 1}
                      />
                    </Form.Item>

                    <Form.Item
                      name="paymentMethod"
                      label="Payment Method"
                      rules={[{ required: true }]}
                    >
                      <Radio.Group size="large">
                        <Radio.Button value="cash">Cash</Radio.Button>
                        <Radio.Button value="cheque">Cheque</Radio.Button>
                        <Radio.Button value="bank-transfer">Bank Transfer</Radio.Button>
                        <Radio.Button value="online">Online</Radio.Button>
                      </Radio.Group>
                    </Form.Item>

                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, curr) => prev.paymentMethod !== curr.paymentMethod}
                    >
                      {({ getFieldValue }) => {
                        const method = getFieldValue('paymentMethod');
                        if (method === 'cheque') {
                          return (
                            <Row gutter={16}>
                              <Col span={12}>
                                <Form.Item name="chequeNumber" label="Cheque Number" rules={[{ required: true }]}>
                                  <Input />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item name="chequeDate" label="Cheque Date" rules={[{ required: true }]}>
                                  <DatePicker style={{ width: '100%' }} />
                                </Form.Item>
                              </Col>
                              <Col span={24}>
                                <Form.Item name="bankName" label="Bank Name" rules={[{ required: true }]}>
                                  <Input />
                                </Form.Item>
                              </Col>
                            </Row>
                          );
                        }
                        if (method === 'bank-transfer') {
                          return (
                            <Form.Item name="transactionId" label="Transaction ID" rules={[{ required: true }]}>
                              <Input />
                            </Form.Item>
                          );
                        }
                        return null;
                      }}
                    </Form.Item>

                    <Form.Item name="notes" label="Notes">
                      <Input.TextArea rows={3} placeholder="Any notes..." />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card style={{ borderRadius: 8 }}>
                      <Title level={5}>Payment Summary</Title>
                      <div style={{ marginBottom: 16 }}>
                        {selectedInvoices.map((key) => {
                          const inv = invoices.find((i) => i.key === key);
                          return (
                            <div
                              key={key}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: 8,
                              }}
                            >
                              <Text>
                                {inv?.period?.month
                                  ? `${inv.period.month}/${inv.period.year}`
                                  : (typeof inv?.period === 'string' ? inv.period : 'N/A')}
                              </Text>
                              <Text>Rs. {inv?.balanceAmount}</Text>
                            </div>
                          );
                        })}
                        {invoices
                          .filter((i) => selectedInvoices.includes(i.key) && i.lateFee > 0)
                          .map((inv) => (
                            <div
                              key={`late-${inv.key}`}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: 8,
                                color: '#ff4d4f',
                              }}
                            >
                              <Text type="danger">
                                Late Fee ({inv?.period?.month ? `${inv.period.month}/${inv.period.year}` : inv?.period})
                              </Text>
                              <Text type="danger">Rs. {inv.lateFee}</Text>
                            </div>
                          ))}
                      </div>
                      <Divider style={{ margin: '12px 0' }} />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 18,
                        }}
                      >
                        <Text strong>Total Due</Text>
                        <Text strong style={{ color: '#1890ff' }}>
                          Rs. {calculateTotal()}
                        </Text>
                      </div>

                      <Divider style={{ margin: '12px 0' }} />

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text>Amount Paying:</Text>
                        <Text strong>Rs. {form.getFieldValue('amount') || 0}</Text>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: (calculateTotal() - (form.getFieldValue('amount') || 0)) > 0 ? '#faad14' : '#52c41a' }}>
                        <Text strong>Remaining Balance:</Text>
                        <Text strong>Rs. {calculateTotal() - (form.getFieldValue('amount') || 0)}</Text>
                      </div>
                    </Card>
                  </Col>
                </Row>

                <Divider />

                <Space>
                  <Button onClick={() => router.back()}>Cancel</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitLoading}
                    icon={<DollarOutlined />}
                    size="large"
                  >
                    Collect Payment
                  </Button>
                </Space>
              </Form>
            </Card>
          )}
        </>
      )
      }
    </div >
  );
}

