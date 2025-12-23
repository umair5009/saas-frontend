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
  Tabs,
  Divider,
  Spin,
  message,
  Statistic,
  Avatar,
  Progress,
  Popconfirm,
} from 'antd';
import {
  BookOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { libraryApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function BookDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id;

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleting, setDeleting] = useState(false);

  // Transactions for tabs
  const [transactions, setTransactions] = useState([]);
  const [transLoading, setTransLoading] = useState(false);

  useEffect(() => {
    if (bookId) {
      fetchBook();
      fetchTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const fetchBook = async () => {
    setLoading(true);
    try {
      const data = await libraryApi.getBookById(bookId);
      if (data.success) {
        setBook(data.data);
      }
    } catch (error) {
      message.error('Failed to fetch book details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setTransLoading(true);
    try {
      const data = await libraryApi.getTransactions({ bookId, limit: 100 }); // Fetch recent 100
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTransLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await libraryApi.deleteBook(bookId);
      message.success('Book deleted successfully');
      router.push('/library');
    } catch (error) {
      message.error(error.message || 'Failed to delete book');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!book) {
    return (
      <Card>
        <Text>Book not found</Text>
        <Button onClick={() => router.back()}>Back</Button>
      </Card>
    );
  }

  // Derived stats
  const currentIssues = transactions.filter(t => t.status === 'issued' || t.status === 'overdue');
  const history = transactions;

  const Overview = () => {
    const availableCopies = book.availableCopies;
    const availabilityPercentage = book.totalCopies > 0 ? ((availableCopies / book.totalCopies) * 100).toFixed(1) : 0;

    return (
      <Row gutter={[24, 24]}>
        {/* Book Stats */}
        <Col xs={24} md={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Copies"
              value={book.totalCopies}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Available"
              value={availableCopies}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress
              percent={parseFloat(availabilityPercentage)}
              showInfo={false}
              strokeColor="#52c41a"
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Issued"
              value={book.statistics?.currentlyIssued || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Lifetime Issues"
              value={book.statistics?.totalIssues || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>

        {/* Book Information */}
        <Col xs={24} lg={12}>
          <Card title="Book Information" style={{ borderRadius: 12 }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Title">
                <Text strong>{book.title}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Author">
                {book.author}
              </Descriptions.Item>
              <Descriptions.Item label="ISBN">
                {book.isbn}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag color="blue">{book.category?.name || 'Uncategorized'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Publisher">
                {book.publisher}
              </Descriptions.Item>
              <Descriptions.Item label="Publication Year">
                {book.publicationYear}
              </Descriptions.Item>
              <Descriptions.Item label="Detailed Location">
                {book.shelf} {book.rack} {book.section}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={availableCopies > 0 ? 'success' : 'error'}>
                  {availableCopies > 0 ? 'Available' : 'Out of Stock'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Current Issues */}
        <Col xs={24} lg={12}>
          <Card title="Current Issues" style={{ borderRadius: 12 }}>
            {currentIssues.length > 0 ? (
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {currentIssues.map((issue, index) => (
                  <div key={issue._id} style={{ marginBottom: index < currentIssues.length - 1 ? 16 : 0 }}>
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Space>
                        <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: issue.borrowerType === 'student' ? '#1890ff' : '#87d068' }} />
                        <div>
                          <Text strong>
                            {issue.student ? `${issue.student.firstName} ${issue.student.lastName}` :
                              issue.staff ? `${issue.staff.name}` : 'Unknown'}
                          </Text>
                          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                            Issued: {dayjs(issue.issueDate).format('DD MMM YYYY')}
                          </div>
                        </div>
                      </Space>
                      <Space split="•">
                        <Text type="secondary">
                          Due: {dayjs(issue.dueDate).format('DD MMM YYYY')}
                        </Text>
                        <Tag color={issue.status === 'overdue' ? 'error' : 'default'}>
                          {issue.status.toUpperCase()}
                        </Tag>
                        {issue.fine?.balanceAmount > 0 && (
                          <Text type="danger">Fine: Rs. {issue.fine.balanceAmount}</Text>
                        )}
                      </Space>
                    </Space>
                    {index < currentIssues.length - 1 && <Divider style={{ margin: '12px 0' }} />}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <BookOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">No books currently issued</Text>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    );
  };

  const HistoryTab = () => {
    const historyColumns = [
      {
        title: 'Borrower',
        key: 'member',
        render: (_, record) => (
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            <div>
              <Text>
                {record.student ? `${record.student.firstName} ${record.student.lastName}` :
                  record.staff ? `${record.staff.name}` : 'Unknown'}
              </Text>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                {record.borrowerType.toUpperCase()}
              </div>
            </div>
          </Space>
        ),
      },
      {
        title: 'Issue Date',
        dataIndex: 'issueDate',
        key: 'issueDate',
        render: (date) => dayjs(date).format('DD MMM YYYY'),
      },
      {
        title: 'Return Date',
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
          return <Tag color={color}>{status.toUpperCase()}</Tag>;
        },
      },
      {
        title: 'Fine',
        key: 'fine',
        render: (_, record) => {
          const amt = record.fine?.amount || 0;
          return amt > 0 ? <Text type="danger">Rs. {amt}</Text> : '-';
        },
      },
    ];

    return (
      <Card title="Transaction History" style={{ borderRadius: 12 }}>
        <Table
          columns={historyColumns}
          dataSource={history}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          loading={transLoading}
          scroll={{ x: 800 }}
        />
      </Card>
    );
  };

  const ReservationsTab = () => {
    // Reservations are not fetched in this page yet.
    // Would need libraryApi.getReservations({ bookId: ... })
    // For now omitting or keeping simpler placeholder.
    return <div style={{ textAlign: 'center', padding: 20 }}>No reservations (Not fully implemented yet)</div>
  };

  const tabItems = [
    { key: 'overview', label: 'Overview', children: <Overview /> },
    { key: 'history', label: 'Issue History', children: <HistoryTab /> },
    { key: 'reservations', label: 'Reservations', children: <ReservationsTab /> },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title={book.title}
        subtitle={`by ${book.author} • ISBN: ${book.isbn || 'N/A'}`}
        breadcrumbs={[
          { title: 'Library', path: '/library' },
          { title: 'Books', path: '/library' },
          { title: book.title },
        ]}
        backButton
        actions={
          <Space>
            <Button icon={<PrinterOutlined />}>Print Details</Button>
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => router.push(`/library/books/${bookId}/edit`)}
            >
              Edit Book
            </Button>
            <Popconfirm
              title="Delete this book?"
              description="This will permanently delete the book. This action cannot be undone."
              onConfirm={handleDelete}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true, loading: deleting }}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={deleting}
              >
                Delete
              </Button>
            </Popconfirm>
          </Space>
        }
      />

      {/* Book Header */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={24} align="middle">
          <Col>
            <Avatar
              size={80}
              shape="square"
              src={book.coverImage}
              style={{ background: '#f0f0f0' }}
              icon={<BookOutlined style={{ color: '#1890ff' }} />}
            />
          </Col>
          <Col flex="auto">
            <Space direction="vertical" size={4}>
              <Space>
                <Title level={3} style={{ marginBottom: 0 }}>
                  {book.title}
                </Title>
                <Tag color="blue">{book.category?.name}</Tag>
                <Tag color={book.availableCopies > 0 ? 'success' : 'error'}>
                  {book.availableCopies > 0 ? 'Available' : 'Out of Stock'}
                </Tag>
              </Space>
              <Space split={<Divider type="vertical" />} wrap>
                <Text type="secondary">Author: {book.author}</Text>
                <Text type="secondary">ISBN: {book.isbn}</Text>
                <Text type="secondary">Publisher: {book.publisher}</Text>
                <Text type="secondary">Year: {book.publicationYear}</Text>
              </Space>
            </Space>
          </Col>
          <Col>
            <div style={{ textAlign: 'right' }}>
              <Statistic
                title="Available Copies"
                value={book.availableCopies}
                suffix={`/ ${book.totalCopies}`}
                valueStyle={{ fontSize: 24, color: '#52c41a' }}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
}