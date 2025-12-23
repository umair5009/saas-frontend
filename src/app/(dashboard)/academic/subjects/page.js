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
    Select,
    InputNumber,
    message,
    Row,
    Col,
    Statistic,
    Dropdown,
    Tabs,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    BookOutlined,
    ExperimentOutlined,
    MoreOutlined,
    FilterOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { academicApi } from '@/lib/api';

const { Option } = Select;
const { TextArea } = Input;

export default function SubjectsPage() {
    const router = useRouter();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [form] = Form.useForm();
    const [filters, setFilters] = useState({ category: null, type: null });
    const [stats, setStats] = useState({ total: 0, theory: 0, practical: 0, both: 0 });

    useEffect(() => {
        fetchSubjects();
    }, [filters]);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const data = await academicApi.getSubjects(filters);
            if (data.success) {
                const subjectsData = data.data || [];
                setSubjects(subjectsData);

                // Calculate stats
                setStats({
                    total: subjectsData.length,
                    theory: subjectsData.filter(s => s.type === 'theory').length,
                    practical: subjectsData.filter(s => s.type === 'practical').length,
                    both: subjectsData.filter(s => s.type === 'both').length,
                });
            }
        } catch (error) {
            message.error('Failed to fetch subjects');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingSubject(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingSubject(record);
        form.setFieldsValue({
            name: record.name,
            code: record.code,
            shortName: record.shortName,
            category: record.category,
            type: record.type,
            credits: record.credits,
            theoryMarks: record.maxMarks?.theory,
            practicalMarks: record.maxMarks?.practical,
            internalMarks: record.maxMarks?.internal,
            theoryPassingMarks: record.passingMarks?.theory,
            practicalPassingMarks: record.passingMarks?.practical,
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await academicApi.deleteSubject(id);
            message.success('Subject deleted successfully');
            fetchSubjects();
        } catch (error) {
            message.error('Failed to delete subject');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const data = {
                name: values.name,
                code: values.code,
                shortName: values.shortName,
                category: values.category,
                type: values.type,
                credits: values.credits || 1,
                maxMarks: {
                    theory: values.theoryMarks || 100,
                    practical: values.practicalMarks || 0,
                    internal: values.internalMarks || 0,
                    total: (values.theoryMarks || 100) + (values.practicalMarks || 0) + (values.internalMarks || 0),
                },
                passingMarks: {
                    theory: values.theoryPassingMarks || 33,
                    practical: values.practicalPassingMarks || 33,
                    total: values.theoryPassingMarks || 33,
                },
            };

            if (editingSubject) {
                await academicApi.updateSubject(editingSubject._id, data);
                message.success('Subject updated successfully');
            } else {
                await academicApi.createSubject(data);
                message.success('Subject created successfully');
            }

            setModalVisible(false);
            form.resetFields();
            fetchSubjects();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to save subject');
        }
    };

    const categoryColors = {
        'core': 'blue',
        'elective': 'green',
        'language': 'purple',
        'science': 'cyan',
        'commerce': 'orange',
        'arts': 'pink',
        'vocational': 'gold',
        'physical-education': 'lime',
    };

    const typeIcons = {
        'theory': <BookOutlined />,
        'practical': <ExperimentOutlined />,
        'both': <BookOutlined />,
    };

    const columns = [
        {
            title: 'Subject',
            key: 'subject',
            render: (_, record) => (
                <Space>
                    {typeIcons[record.type]}
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.name}</div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                            Code: {record.code} {record.shortName && `• ${record.shortName}`}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (category) => (
                <Tag color={categoryColors[category]}>
                    {category?.replace('-', ' ').toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </Tag>
            ),
        },
        {
            title: 'Credits',
            dataIndex: 'credits',
            key: 'credits',
            align: 'center',
        },
        {
            title: 'Max Marks',
            key: 'maxMarks',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    {record.maxMarks?.theory > 0 && <div>Theory: {record.maxMarks.theory}</div>}
                    {record.maxMarks?.practical > 0 && <div>Practical: {record.maxMarks.practical}</div>}
                    {record.maxMarks?.internal > 0 && <div>Internal: {record.maxMarks.internal}</div>}
                    <div style={{ fontWeight: 500 }}>Total: {record.maxMarks?.total}</div>
                </Space>
            ),
        },
        {
            title: 'Passing Marks',
            key: 'passingMarks',
            render: (_, record) => record.passingMarks?.total || 33,
            align: 'center',
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
                            { type: 'divider' },
                            {
                                key: 'delete',
                                icon: <DeleteOutlined />,
                                label: 'Delete',
                                danger: true,
                                onClick: () => {
                                    Modal.confirm({
                                        title: 'Delete Subject',
                                        content: 'Are you sure you want to delete this subject?',
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
                title="Subjects"
                subtitle="Manage subjects and curriculum"
                breadcrumbs={[{ title: 'Academic' }, { title: 'Subjects' }]}
                actions={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Add Subject
                    </Button>
                }
            />

            {/* Statistics */}
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={6}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Total Subjects"
                            value={stats.total}
                            prefix={<BookOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Theory"
                            value={stats.theory}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Practical"
                            value={stats.practical}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Both"
                            value={stats.both}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 16, borderRadius: 12 }}>
                <Row gutter={16}>
                    <Col xs={24} sm={8}>
                        <Select
                            placeholder="Filter by Category"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={(value) => setFilters({ ...filters, category: value })}
                        >
                            <Option value="core">Core</Option>
                            <Option value="elective">Elective</Option>
                            <Option value="language">Language</Option>
                            <Option value="science">Science</Option>
                            <Option value="commerce">Commerce</Option>
                            <Option value="arts">Arts</Option>
                            <Option value="vocational">Vocational</Option>
                            <Option value="physical-education">Physical Education</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Select
                            placeholder="Filter by Type"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={(value) => setFilters({ ...filters, type: value })}
                        >
                            <Option value="theory">Theory</Option>
                            <Option value="practical">Practical</Option>
                            <Option value="both">Both</Option>
                        </Select>
                    </Col>
                </Row>
            </Card>

            {/* Table */}
            <Card style={{ borderRadius: 12 }}>
                <Table
                    columns={columns}
                    dataSource={subjects}
                    loading={loading}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={editingSubject ? 'Edit Subject' : 'Create Subject'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Tabs
                        items={[
                            {
                                key: 'basic',
                                label: 'Basic Information',
                                children: (
                                    <>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item
                                                    name="name"
                                                    label="Subject Name"
                                                    rules={[{ required: true, message: 'Please enter subject name' }]}
                                                >
                                                    <Input placeholder="e.g., Mathematics, Physics" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name="code"
                                                    label="Subject Code"
                                                    rules={[{ required: true, message: 'Please enter subject code' }]}
                                                >
                                                    <Input placeholder="e.g., MATH101, PHY201" />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col span={8}>
                                                <Form.Item name="shortName" label="Short Name">
                                                    <Input placeholder="e.g., Math, Phy" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item
                                                    name="category"
                                                    label="Category"
                                                    rules={[{ required: true }]}
                                                >
                                                    <Select placeholder="Select category">
                                                        <Option value="core">Core</Option>
                                                        <Option value="elective">Elective</Option>
                                                        <Option value="language">Language</Option>
                                                        <Option value="science">Science</Option>
                                                        <Option value="commerce">Commerce</Option>
                                                        <Option value="arts">Arts</Option>
                                                        <Option value="vocational">Vocational</Option>
                                                        <Option value="physical-education">Physical Education</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item
                                                    name="type"
                                                    label="Type"
                                                    rules={[{ required: true }]}
                                                    initialValue="theory"
                                                >
                                                    <Select>
                                                        <Option value="theory">Theory</Option>
                                                        <Option value="practical">Practical</Option>
                                                        <Option value="both">Both</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Form.Item name="credits" label="Credits" initialValue={1}>
                                            <InputNumber min={1} max={10} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </>
                                ),
                            },
                            {
                                key: 'marks',
                                label: 'Marks Configuration',
                                children: (
                                    <>
                                        <Row gutter={16}>
                                            <Col span={8}>
                                                <Form.Item
                                                    name="theoryMarks"
                                                    label="Theory Max Marks"
                                                    initialValue={100}
                                                >
                                                    <InputNumber min={0} style={{ width: '100%' }} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item
                                                    name="practicalMarks"
                                                    label="Practical Max Marks"
                                                    initialValue={0}
                                                >
                                                    <InputNumber min={0} style={{ width: '100%' }} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item
                                                    name="internalMarks"
                                                    label="Internal Max Marks"
                                                    initialValue={0}
                                                >
                                                    <InputNumber min={0} style={{ width: '100%' }} />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item
                                                    name="theoryPassingMarks"
                                                    label="Theory Passing Marks"
                                                    initialValue={33}
                                                >
                                                    <InputNumber min={0} style={{ width: '100%' }} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name="practicalPassingMarks"
                                                    label="Practical Passing Marks"
                                                    initialValue={33}
                                                >
                                                    <InputNumber min={0} style={{ width: '100%' }} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </>
                                ),
                            },
                        ]}
                    />

                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit">
                                {editingSubject ? 'Update' : 'Create'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
