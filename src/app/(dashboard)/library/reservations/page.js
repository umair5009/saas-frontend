'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    Table,
    Button,
    Space,
    Modal,
    Form,
    Select,
    message,
    Tag,
    Typography,
    Input,
    DatePicker,
    Popconfirm
} from 'antd';
import {
    PlusOutlined,
    BookOutlined,
    UserOutlined,
    CloseCircleOutlined,
    SearchOutlined
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { libraryApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

export default function ReservationsPage() {
    const router = useRouter();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();

    // Search states
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [searchingBooks, setSearchingBooks] = useState(false);
    const [searchingMembers, setSearchingMembers] = useState(false);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const data = await libraryApi.getReservations();
            if (data.success) {
                setReservations(data.data);
            }
        } catch (error) {
            message.error('Failed to fetch reservations');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchBooks = async (value) => {
        if (!value) return;
        setSearchingBooks(true);
        try {
            const data = await libraryApi.getBooks({ search: value, available: true });
            if (data.success) {
                setBooks(data.data);
            }
        } catch (error) {
            console.error('Failed to search books');
        } finally {
            setSearchingBooks(false);
        }
    };

    const handleSearchMembers = async (value) => {
        if (!value) return;
        setSearchingMembers(true);
        try {
            const data = await libraryApi.getMembers({ search: value });
            if (data.success) {
                setMembers(data.data);
            }
        } catch (error) {
            console.error('Failed to search members');
        } finally {
            setSearchingMembers(false);
        }
    };

    const handleCreate = () => {
        form.resetFields();
        setModalOpen(true);
    };

    const handleSubmit = async (values) => {
        try {
            const payload = {
                bookId: values.book,
                reserverType: values.memberType,  // Backend expects reserverType
                [values.memberType === 'student' ? 'studentId' : 'staffId']: values.member,
                expiryDate: values.expiryDate?.toISOString(),
            };

            await libraryApi.reserveBook(payload);
            message.success('Reservation created successfully');
            setModalOpen(false);
            form.resetFields();
            fetchReservations();
        } catch (error) {
            message.error(error.message || 'Failed to create reservation');
        }
    };

    const handleCancel = async (id) => {
        try {
            await libraryApi.cancelReservation(id);
            message.success('Reservation cancelled successfully');
            fetchReservations();
        } catch (error) {
            message.error('Failed to cancel reservation');
        }
    };

    const columns = [
        {
            title: 'Book',
            dataIndex: ['book', 'title'],
            key: 'book',
            render: (title, record) => (
                <Space>
                    <BookOutlined />
                    <div>
                        <Text strong>{title}</Text>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                            {record.book?.author}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Member',
            key: 'member',
            render: (_, record) => {
                const member = record.student || record.staff;
                const name = record.student
                    ? `${member?.firstName} ${member?.lastName}`
                    : member?.name;

                return (
                    <Space>
                        <UserOutlined />
                        <div>
                            <Text>{name}</Text>
                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                {record.memberType?.toUpperCase()}
                            </div>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: 'Reserved Date',
            dataIndex: 'reservedDate',
            key: 'reservedDate',
            render: (date) => dayjs(date).format('DD MMM YYYY'),
        },
        {
            title: 'Expiry Date',
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            render: (date) => {
                const isExpired = dayjs().isAfter(dayjs(date));
                return (
                    <Text type={isExpired ? 'danger' : undefined}>
                        {dayjs(date).format('DD MMM YYYY')}
                    </Text>
                );
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = {
                    active: 'processing',
                    fulfilled: 'success',
                    expired: 'error',
                    cancelled: 'default',
                };
                return <Tag color={colors[status]}>{status?.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                record.status === 'active' && (
                    <Popconfirm
                        title="Cancel reservation?"
                        description="This action cannot be undone."
                        onConfirm={() => handleCancel(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="link"
                            size="small"
                            danger
                            icon={<CloseCircleOutlined />}
                        >
                            Cancel
                        </Button>
                    </Popconfirm>
                )
            ),
        },
    ];

    return (
        <div className="fade-in">
            <PageHeader
                title="Book Reservations"
                subtitle="Manage book reservations and waiting lists"
                breadcrumbs={[
                    { title: 'Library', path: '/library' },
                    { title: 'Reservations' },
                ]}
                backButton
                actions={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        New Reservation
                    </Button>
                }
            />

            <Card style={{ borderRadius: 12 }}>
                <Table
                    columns={columns}
                    dataSource={reservations}
                    loading={loading}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title="Create Reservation"
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
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
                        memberType: 'student',
                        expiryDate: dayjs().add(7, 'days'),
                    }}
                >
                    <Form.Item
                        name="book"
                        label="Book"
                        rules={[{ required: true, message: 'Please select a book' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Search and select book"
                            onSearch={handleSearchBooks}
                            loading={searchingBooks}
                            filterOption={false}
                            suffixIcon={<SearchOutlined />}
                        >
                            {books.map(book => (
                                <Option key={book._id} value={book._id}>
                                    {book.title} - {book.author}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="memberType"
                        label="Member Type"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Option value="student">Student</Option>
                            <Option value="staff">Staff</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="member"
                        label="Member"
                        rules={[{ required: true, message: 'Please select a member' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Search and select member"
                            onSearch={handleSearchMembers}
                            loading={searchingMembers}
                            filterOption={false}
                            suffixIcon={<SearchOutlined />}
                        >
                            {members.map(member => (
                                <Option key={member._id} value={member._id}>
                                    {member.firstName ? `${member.firstName} ${member.lastName}` : member.name}
                                    {' - '}
                                    {member.admissionNumber || member.employeeId}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="expiryDate"
                        label="Expiry Date"
                        rules={[{ required: true, message: 'Please select expiry date' }]}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Create Reservation
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
