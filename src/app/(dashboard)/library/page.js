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
  Statistic,
  Tabs,
  Input,
  Select,
  Form,
  Avatar,
  Badge,
  Table,
  DatePicker,
  InputNumber,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  BookOutlined,
  UserOutlined,
  SwapOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  DownloadOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { libraryApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export default function LibraryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('books');
  const [stats, setStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);

  // Table Data States
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState('');

  // Modals
  const [issueModal, setIssueModal] = useState({ open: false, book: null });
  const [returnModal, setReturnModal] = useState({ open: false, transaction: null });

  // Forms
  const [issueForm] = Form.useForm();
  const [returnForm] = Form.useForm();

  // Members for Issue Modal
  const [members, setMembers] = useState([]);
  const [memberLoading, setMemberLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab, pagination.current, pagination.pageSize, searchText]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await libraryApi.getDashboard();
      if (data.success) {
        setStats(data.data.overview);
      }
    } catch (error) {
      console.error(error);
      // Fail silently for stats or show notification
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText,
      };

      let response;
      if (activeTab === 'books') {
        response = await libraryApi.getBooks(params);
        if (response.success) {
          setData(response.data);
          setPagination({ ...pagination, total: response.pagination.total });
        }
      } else if (activeTab === 'transactions') {
        response = await libraryApi.getTransactions(params);
        console.log("transactions", response)
        if (response.success) {
          setData(response.data || []);
          setPagination({ ...pagination, total: response.pagination?.total || response.total || 0 });
        }
      } else if (activeTab === 'overdue') {
        response = await libraryApi.getTransactions({ ...params, overdue: true });
        if (response.success) {
          setData(response.data || []);
          setPagination({ ...pagination, total: response.pagination?.total || response.total || 0 });
        }
      }
    } catch (error) {
      message.error('Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchMember = async (value) => {
    if (!value) return;
    setMemberLoading(true);
    try {
      const data = await libraryApi.getMembers({ search: value });
      if (data.success) {
        setMembers(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setMemberLoading(false);
    }
  };

  const handleIssueBook = async (values) => {
    try {
      const [type, id] = values.memberString.split(':');
      const payload = {
        bookId: issueModal.book._id,
        borrowerType: type,
        studentId: type === 'student' ? id : undefined,
        staffId: type === 'staff' ? id : undefined,
        dueDate: values.dueDate.format('YYYY-MM-DD'),
      };

      if (values.copyNumber) {
        payload.copyNumber = values.copyNumber;
      }

      await libraryApi.issueBook(payload);
      message.success('Book issued successfully!');
      setIssueModal({ open: false, book: null });
      issueForm.resetFields();
      fetchStats();
      fetchData(); // Refresh current tab
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to issue book');
    }
  };

  const handleReturnBook = async (values) => {
    try {
      const payload = {
        transactionId: returnModal.transaction._id,
        conditionAtReturn: values.conditionAtReturn,
        damageNotes: values.damageNotes,
        damageCharge: values.damageCharge,
      };

      const data = await libraryApi.returnBook(payload);

      message.success('Book returned successfully!');
      if (data.fine && data.fine.amount > 0) {
        message.warning(`Fine Generated: ${data.fine.amount}`);
      }

      setReturnModal({ open: false, transaction: null });
      returnForm.resetFields();
      fetchStats();
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to return book');
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPagination({ ...pagination, current: 1 });
    setSearchText('');
  };

  const bookColumns = [
    {
      title: 'Book',
      key: 'book',
      width: 300,
      render: (_, record) => (
        <Space>
          <Avatar
            shape="square"
            size={48}
            src={record.coverImage}
            style={{ background: '#f0f0f0' }}
            icon={<BookOutlined style={{ color: '#1890ff' }} />}
          />
          <div>
            <Text strong>{record.title}</Text>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              by {record.author}
              {record.isbn && ` • ISBN: ${record.isbn}`}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (text) => <Tag>{text || 'Uncategorized'}</Tag>,
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, r) => [r.shelf, r.rack].filter(Boolean).join(' - ') || '-',
    },
    {
      title: 'Copies',
      key: 'copies',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>Available: <strong style={{ color: record.availableCopies > 0 ? '#52c41a' : '#ff4d4f' }}>{record.availableCopies}</strong></Text>
          <Text type="secondary" style={{ fontSize: 12 }}>Total: {record.totalCopies}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        let color = 'green';
        let text = 'AVAILABLE';
        if (record.availableCopies === 0) {
          color = 'red';
          text = 'OUT OF STOCK';
        } else if (record.availableCopies < 2) {
          color = 'orange';
          text = 'LOW STOCK';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              setIssueModal({ open: true, book: record });
              handleSearchMember('a'); // Pre-fetch some members
            }}
            disabled={record.availableCopies === 0}
          >
            Issue
          </Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'view',
                  icon: <EyeOutlined />,
                  label: 'View Details',
                  onClick: () => router.push(`/library/books/${record._id}`)
                },
                { key: 'edit', icon: <EditOutlined />, label: 'Edit' }, // Implement edit later
                { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true }, // Implement delete later
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const transactionColumns = [
    {
      title: 'Book',
      dataIndex: ['book', 'title'],
      key: 'book',
      render: (text, record) => (
        <Space>
          <Avatar icon={<BookOutlined />} size="small" shape="square" />
          <Space direction="vertical" size={0}>
            <Text strong>{text || 'Unknown Book'}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>Copy: {record.copyNumber}</Text>
          </Space>
        </Space>
      )
    },
    {
      title: 'Borrower',
      key: 'member',
      render: (_, record) => {
        const member = record?.student || record?.staff;
        const type = record?.borrowerType;

        if (!type || !member) {
          return <Text type="secondary">-</Text>;
        }

        return (
          <Space>
            <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: type === 'student' ? '#1890ff' : '#87d068' }} />
            <div>
              <Text>{member?.firstName ? `${member.firstName} ${member.lastName}` : member?.name || 'Unknown'}</Text>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                {type.toUpperCase()} • {member?.admissionNumber || member?.employeeId || '-'}
              </div>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Issued',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (date) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date, record) => {
        const isOverdue = dayjs().isAfter(dayjs(date)) && record.status === 'issued';
        return (
          <Text type={isOverdue ? 'danger' : undefined} strong={isOverdue}>
            {dayjs(date).format('DD MMM YYYY')}
          </Text>
        );
      },
    },
    {
      title: 'Returned',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: (date) => date ? dayjs(date).format('DD MMM YYYY') : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'blue';
        if (status === 'returned') color = 'green';
        if (status === 'overdue') color = 'red';
        if (status === 'lost') color = 'gray';

        return (
          <Tag color={color}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Fine',
      key: 'fine',
      render: (_, record) => {
        const fineAmt = record.fine?.amount || 0;
        const paid = record.fine?.paidAmount || 0;
        const bal = record.fine?.balanceAmount || 0;

        if (fineAmt === 0) return '-';

        return (
          <Space direction="vertical" size={0}>
            <Text type="danger">Rs. {fineAmt}</Text>
            {bal > 0 ? <Tag color="red" style={{ fontSize: 10, margin: 0 }}>Unpaid: {bal}</Tag> : <Tag color="green" style={{ fontSize: 10, margin: 0 }}>Paid</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        record.status === 'issued' || record.status === 'overdue' ? (
          <Button
            type="primary"
            size="small"
            onClick={() => setReturnModal({ open: true, transaction: record })}
          >
            Return
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Library Management"
        subtitle="Manage books, issue/return, and track transactions"
        breadcrumbs={[{ title: 'Library' }]}
        actions={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/library/books/create')}
            >
              Add Book
            </Button>
          </Space>
        }
      />

      {/* Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} md={4}>
          <Card style={{ borderRadius: 12 }} loading={statsLoading}>
            <Statistic
              title="Total Books"
              value={stats.totalBooks}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card style={{ borderRadius: 12 }} loading={statsLoading}>
            <Statistic
              title="Available Copies"
              value={stats.availableCopies}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card style={{ borderRadius: 12 }} loading={statsLoading}>
            <Statistic
              title="Issued Books"
              value={stats.issuedBooks}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card style={{ borderRadius: 12 }} loading={statsLoading}>
            <Statistic
              title="Overdue"
              value={stats.overdueBooks}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card style={{ borderRadius: 12 }} loading={statsLoading}>
            <Statistic
              title="Today's Reservations"
              value={stats.activeReservations}
              prefix={<SwapOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card style={{ borderRadius: 12 }} loading={statsLoading}>
            <Statistic
              title="Members"
              value={stats.totalMembers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card style={{ borderRadius: 12 }}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          tabBarExtraContent={
            <Space>
              <Input.Search
                placeholder="Search..."
                onSearch={(val) => { setSearchText(val); setPagination({ ...pagination, current: 1 }); }}
                style={{ width: 250 }}
                allowClear
              />
              <Button icon={<ReloadOutlined />} onClick={fetchData} />
            </Space>
          }
          items={[
            {
              key: 'books',
              label: <><BookOutlined /> Books</>,
              children: (
                <Table
                  columns={bookColumns}
                  dataSource={data}
                  loading={loading}
                  pagination={pagination}
                  onChange={handleTableChange}
                  rowKey="_id"
                  scroll={{ x: 800 }}
                />
              )
            },
            {
              key: 'transactions',
              label: <><SwapOutlined /> Transactions</>,
              children: (
                <Table
                  columns={transactionColumns}
                  dataSource={data}
                  loading={loading}
                  pagination={pagination}
                  onChange={handleTableChange}
                  rowKey="_id"
                  scroll={{ x: 1000 }}
                />
              )
            },
            {
              key: 'overdue',
              label: (
                <Badge count={stats.overdueBooks} size="small" offset={[10, 0]}>
                  <span><ExclamationCircleOutlined /> Overdue</span>
                </Badge>
              ),
              children: (
                <Table
                  columns={transactionColumns}
                  dataSource={data}
                  loading={loading}
                  pagination={pagination}
                  onChange={handleTableChange}
                  rowKey="_id"
                  scroll={{ x: 1000 }}
                />
              )
            }
          ]}
        />
      </Card>

      {/* Issue Book Modal */}
      <Modal
        title={
          <Space>
            <BookOutlined />
            <span>Issue Book: {issueModal.book?.title}</span>
          </Space>
        }
        open={issueModal.open}
        onCancel={() => {
          setIssueModal({ open: false, book: null });
          issueForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form form={issueForm} layout="vertical" onFinish={handleIssueBook}>
          <Form.Item
            name="memberString"
            label="Select Member"
            rules={[{ required: true, message: 'Please select a member' }]}
          >
            <Select
              showSearch
              placeholder="Search student or staff..."
              filterOption={false}
              onSearch={handleSearchMember}
              loading={memberLoading}
              notFoundContent={memberLoading ? 'Searching...' : null}
            >
              {members.map(m => (
                <Option key={m._id} value={`${m.type}:${m._id}`}>
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: m.type === 'student' ? '#1890ff' : '#87d068' }} />
                    <Space direction="vertical" size={0} style={{ lineHeight: 1.2 }}>
                      <Text>{m.firstName} {m.lastName}</Text>
                      <Text type="secondary" style={{ fontSize: 10 }}>{m.type.toUpperCase()} • {m.admissionNumber || m.employeeId}</Text>
                    </Space>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="Due Date"
                rules={[{ required: true }]}
                initialValue={dayjs().add(14, 'days')}
              >
                <DatePicker style={{ width: '100%' }} disabledDate={(d) => d < dayjs()} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="copyNumber"
                label="Copy Number (Optional)"
                help="Leave empty to auto-assign"
              >
                <InputNumber style={{ width: '100%' }} placeholder="e.g. 1" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIssueModal({ open: false, book: null })}>Cancel</Button>
              <Button type="primary" htmlType="submit">Confirm Issue</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Return Book Modal */}
      <Modal
        title="Return Book"
        open={returnModal.open}
        onCancel={() => {
          setReturnModal({ open: false, transaction: null });
          returnForm.resetFields();
        }}
        footer={null}
      >
        <div style={{ marginBottom: 20 }}>
          <p><strong>Book:</strong> {returnModal.transaction?.book?.title}</p>
          <p><strong>Member:</strong> {returnModal.transaction?.student ? `${returnModal.transaction?.student?.firstName} ${returnModal.transaction?.student?.lastName}` : returnModal.transaction?.staff?.name}</p>
          <p><strong>Due Date:</strong> {dayjs(returnModal.transaction?.dueDate).format('DD MMM YYYY')}</p>
          {returnModal.transaction?.fine?.amount > 0 && <p style={{ color: 'red' }}><strong>Current Fine:</strong> Rs. {returnModal.transaction?.fine?.amount}</p>}
        </div>

        <Form form={returnForm} layout="vertical" onFinish={handleReturnBook}>
          <Form.Item
            name="conditionAtReturn"
            label="Book Condition"
            initialValue="good"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="new">New</Option>
              <Option value="good">Good</Option>
              <Option value="fair">Fair</Option>
              <Option value="poor">Poor</Option>
              <Option value="damaged">Damaged</Option>
              <Option value="lost">Lost</Option>
            </Select>
          </Form.Item>

          <Form.Item name="damageCharge" label="Damage Charge (if any)">
            <InputNumber prefix="Rs." style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="damageNotes" label="Damage Notes">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setReturnModal({ open: false, transaction: null })}>Cancel</Button>
              <Button type="primary" htmlType="submit">Confirm Return</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
