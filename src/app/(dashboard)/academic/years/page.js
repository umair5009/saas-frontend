'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    Button,
    Table,
    Space,
    Tag,
    Modal,
    Form,
    Input,
    DatePicker,
    Switch,
    message,
    Popconfirm,
    Row,
    Col,
    Statistic,
    Dropdown,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    MoreOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { academicApi } from '@/lib/api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function AcademicYearsPage() {
    const router = useRouter();
    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingYear, setEditingYear] = useState(null);
    const [form] = Form.useForm();
    const [stats, setStats] = useState({ total: 0, current: 0, upcoming: 0 });

    useEffect(() => {
        fetchAcademicYears();
    }, []);

    const fetchAcademicYears = async () => {
        setLoading(true);
        try {
            const data = await academicApi.getAcademicYears();
            if (data.success) {
                const years = data.data || [];
                setAcademicYears(years);

                // Calculate stats
                const now = new Date();
                setStats({
                    total: years.length,
                    current: years.filter(y => y.isCurrent).length,
                    upcoming: years.filter(y => new Date(y.startDate) > now).length,
                });
            }
        } catch (error) {
            message.error('Failed to fetch academic years');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingYear(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingYear(record);
        form.setFieldsValue({
            name: record.name,
            dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
            workingDays: record.workingDays || [],
            isCurrent: record.isCurrent,
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await academicApi.deleteAcademicYear(id);
            message.success('Academic year deleted successfully');
            fetchAcademicYears();
        } catch (error) {
            message.error('Failed to delete academic year');
        }
    };

    const handleSetCurrent = async (id) => {
        try {
            await academicApi.setCurrentAcademicYear(id);
            message.success('Academic year set as current');
            fetchAcademicYears();
        } catch (error) {
            message.error('Failed to set current academic year');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const data = {
                name: values.name,
                startDate: values.dateRange[0].format('YYYY-MM-DD'),
                endDate: values.dateRange[1].format('YYYY-MM-DD'),
                workingDays: values.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                isCurrent: values.isCurrent || false,
            };

            if (editingYear) {
                await academicApi.updateAcademicYear(editingYear._id, data);
                message.success('Academic year updated successfully');
            } else {
                await academicApi.createAcademicYear(data);
                message.success('Academic year created successfully');
            }

            setModalVisible(false);
            form.resetFields();
            fetchAcademicYears();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to save academic year');
        }
    };

    const columns = [
        {
            title: 'Academic Year',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <CalendarOutlined style={{ color: '#1890ff' }} />
                    <span style={{ fontWeight: 500 }}>{text}</span>
                    {record.isCurrent && (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                            Current
                        </Tag>
                    )}
                </Space>
            ),
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date) => dayjs(date).format('DD MMM YYYY'),
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (date) => dayjs(date).format('DD MMM YYYY'),
        },
        {
            title: 'Duration',
            key: 'duration',
            render: (_, record) => {
                const start = dayjs(record.startDate);
                const end = dayjs(record.endDate);
                const months = end.diff(start, 'month');
                return `${months} months`;
            },
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => {
                const now = dayjs();
                const start = dayjs(record.startDate);
                const end = dayjs(record.endDate);

                if (now.isBefore(start)) {
                    return <Tag color="blue">Upcoming</Tag>;
                } else if (now.isAfter(end)) {
                    return <Tag color="default">Completed</Tag>;
                } else {
                    return <Tag color="green">Active</Tag>;
                }
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: 'edit',
                                icon: <EditOutlined />,
                                label: 'Edit',
                                onClick: () => handleEdit(record),
                            },
                            {
                                key: 'setCurrent',
                                icon: <CheckCircleOutlined />,
                                label: 'Set as Current',
                                disabled: record.isCurrent,
                                onClick: () => handleSetCurrent(record._id),
                            },
                            { type: 'divider' },
                            {
                                key: 'delete',
                                icon: <DeleteOutlined />,
                                label: 'Delete',
                                danger: true,
                                disabled: record.isCurrent,
                                onClick: () => {
                                    Modal.confirm({
                                        title: 'Delete Academic Year',
                                        content: 'Are you sure you want to delete this academic year?',
                                        okText: 'Delete',
                                        okType: 'danger',
                                        onOk: () => handleDelete(record._id),
                                    });
                                },
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

    return (
        <div className="fade-in">
            <PageHeader
                title="Academic Years"
                subtitle="Manage academic years and terms"
                breadcrumbs={[{ title: 'Academic' }, { title: 'Academic Years' }]}
                actions={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Add Academic Year
                    </Button>
                }
            />

            {/* Statistics */}
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Total Academic Years"
                            value={stats.total}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Current Year"
                            value={stats.current}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Upcoming Years"
                            value={stats.upcoming}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Table */}
            <Card style={{ borderRadius: 12 }}>
                <Table
                    columns={columns}
                    dataSource={academicYears}
                    loading={loading}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={editingYear ? 'Edit Academic Year' : 'Create Academic Year'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
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
                        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                    }}
                >
                    <Form.Item
                        name="name"
                        label="Academic Year Name"
                        rules={[{ required: true, message: 'Please enter academic year name' }]}
                    >
                        <Input placeholder="e.g., 2024-2025" />
                    </Form.Item>

                    <Form.Item
                        name="dateRange"
                        label="Date Range"
                        rules={[{ required: true, message: 'Please select date range' }]}
                    >
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="isCurrent" label="Set as Current Year" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit">
                                {editingYear ? 'Update' : 'Create'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
