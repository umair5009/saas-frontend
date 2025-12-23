'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
    Card,
    Row,
    Col,
    Statistic,
    Table,
    Tag,
    Button,
    Space,
    Typography,
    Divider,
    Modal,
    Form,
    InputNumber,
    Input,
    message,
    Avatar
} from 'antd';
import {
    UserOutlined,
    BookOutlined,
    HistoryOutlined,
    DollarOutlined,
    ArrowLeftOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { libraryApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function MemberDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const memberId = params.id;
    const memberType = searchParams.get('type');

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ transactions: [], stats: {} });
    const [collectFineModal, setCollectFineModal] = useState({ open: false, transaction: null });

    useEffect(() => {
        if (memberId && memberType) {
            fetchHistory();
        }
    }, [memberId, memberType]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await libraryApi.getMemberHistory(memberType, memberId);
            if (data.success) {
                setData(data.data);
            }
        } catch (error) {
            message.error('Failed to fetch member history');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCollectFine = async (values) => {
        try {
            await libraryApi.collectFine(collectFineModal.transaction._id, values);
            message.success('Fine collected successfully');
            setCollectFineModal({ open: false, transaction: null });
            fetchHistory();
        } catch (error) {
            message.error('Failed to collect fine');
        }
    };

    const columns = [
        {
            title: 'Book',
            dataIndex: ['book', 'title'],
            key: 'book',
            render: (text) => <Text strong>{text || 'Unknown Book'}</Text>,
        },
        {
            title: 'Issued Date',
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
                return <Text type={isOverdue ? 'danger' : undefined}>{dayjs(date).format('DD MMM YYYY')}</Text>;
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
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Fine',
            key: 'fine',
            render: (_, record) => {
                const balance = record.fine?.balanceAmount || 0;
                const paid = record.fine?.paidAmount || 0;
                const total = record.fine?.amount || 0;

                if (total === 0) return '-';

                return (
                    <Space direction="vertical" size={0}>
                        <Text>Total: {total}</Text>
                        {balance > 0 ? <Text type="danger">Due: {balance}</Text> : <Text type="success">Paid</Text>}
                    </Space>
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                if (record.fine?.balanceAmount > 0) {
                    return (
                        <Button
                            size="small"
                            type="primary"
                            danger
                            onClick={() => setCollectFineModal({ open: true, transaction: record })}
                        >
                            Collect Fine
                        </Button>
                    );
                }
                return null;
            }
        }
    ];

    return (
        <div className="fade-in">
            <PageHeader
                title="Member Details"
                subtitle={`Viewing history for ${memberType?.toUpperCase()}`}
                breadcrumbs={[
                    { title: 'Library', path: '/library' },
                    { title: 'Members', path: '/library/members' },
                    { title: 'Details' },
                ]}
                backButton
            />

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} md={6}>
                    <Card style={{ textAlign: 'center', borderRadius: 12 }}>
                        <Avatar size={64} icon={<UserOutlined />} style={{ marginBottom: 16, backgroundColor: '#1890ff' }} />
                        <Title level={4} style={{ marginBottom: 4 }}>Member ID: {memberId}</Title>
                        <Tag color="blue">{memberType?.toUpperCase()}</Tag>
                    </Card>
                </Col>
                <Col xs={24} md={18}>
                    <Row gutter={[16, 16]}>
                        <Col span={8}>
                            <Card>
                                <Statistic title="Total Borrowed" value={data.stats.totalBorrowed || 0} prefix={<BookOutlined />} />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="Currently Issued"
                                    value={data.stats.currentlyIssued || 0}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="Unpaid Fines"
                                    value={data.stats.totalFines ? (data.stats.totalFines - (data.stats.paidFines || 0)) : 0}
                                    prefix="Rs."
                                    valueStyle={{ color: '#ff4d4f' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <Card title="Loan History" style={{ borderRadius: 12 }}>
                <Table
                    columns={columns}
                    dataSource={data.transactions}
                    loading={loading}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title="Collect Fine"
                open={collectFineModal.open}
                onCancel={() => setCollectFineModal({ open: false, transaction: null })}
                footer={null}
            >
                <p>Collecting fine for book: <strong>{collectFineModal.transaction?.book?.title}</strong></p>
                <p>Outstanding Amount: <strong style={{ color: 'red' }}>Rs. {collectFineModal.transaction?.fine?.balanceAmount}</strong></p>

                <Form
                    layout="vertical"
                    onFinish={handleCollectFine}
                    initialValues={{ amount: collectFineModal.transaction?.fine?.balanceAmount }}
                >
                    <Form.Item
                        name="amount"
                        label="Amount to Collect"
                        rules={[{ required: true }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            max={collectFineModal.transaction?.fine?.balanceAmount}
                        />
                    </Form.Item>
                    <Form.Item name="receiptNumber" label="Receipt Number">
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>Collect Payment</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
