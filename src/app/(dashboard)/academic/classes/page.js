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
    Divider,
    List,
    Badge,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    BookOutlined,
    TeamOutlined,
    MoreOutlined,
    UserOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { academicApi } from '@/lib/api';

const { Option } = Select;

export default function ClassesPage() {
    const router = useRouter();
    const [classes, setClasses] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [sectionModalVisible, setSectionModalVisible] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [form] = Form.useForm();
    const [sectionForm] = Form.useForm();
    const [stats, setStats] = useState({ totalClasses: 0, totalSections: 0, totalStudents: 0 });

    useEffect(() => {
        fetchClasses();
        fetchAcademicYears();
    }, []);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const data = await academicApi.getClasses();
            if (data.success) {
                const classesData = data.data || [];
                setClasses(classesData);

                // Calculate stats
                const totalSections = classesData.reduce((sum, cls) => sum + (cls.sections?.length || 0), 0);
                const totalStudents = classesData.reduce((sum, cls) =>
                    sum + (cls.sections?.reduce((s, sec) => s + (sec.currentStrength || 0), 0) || 0), 0
                );

                setStats({
                    totalClasses: classesData.length,
                    totalSections,
                    totalStudents,
                });
            }
        } catch (error) {
            message.error('Failed to fetch classes');
            console.error(error);
        } finally {
            setLoading(false);
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

    const handleCreate = () => {
        setEditingClass(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingClass(record);
        form.setFieldsValue({
            name: record.name,
            code: record.code,
            level: record.level,
            category: record.category,
            academicYear: record.academicYear,
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await academicApi.deleteClass(id);
            message.success('Class deleted successfully');
            fetchClasses();
        } catch (error) {
            message.error('Failed to delete class');
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (editingClass) {
                await academicApi.updateClass(editingClass._id, values);
                message.success('Class updated successfully');
            } else {
                await academicApi.createClass(values);
                message.success('Class created successfully');
            }

            setModalVisible(false);
            form.resetFields();
            fetchClasses();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to save class');
        }
    };

    const handleAddSection = (classRecord) => {
        setSelectedClass(classRecord);
        sectionForm.resetFields();
        setSectionModalVisible(true);
    };

    const handleSectionSubmit = async (values) => {
        try {
            await academicApi.addSection(selectedClass._id, values);
            message.success('Section added successfully');
            setSectionModalVisible(false);
            sectionForm.resetFields();
            fetchClasses();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to add section');
        }
    };

    const categoryColors = {
        'pre-primary': 'pink',
        'primary': 'blue',
        'middle': 'green',
        'secondary': 'orange',
        'higher-secondary': 'purple',
    };

    const columns = [
        {
            title: 'Class',
            key: 'class',
            render: (_, record) => (
                <Space>
                    <BookOutlined style={{ color: '#1890ff', fontSize: 18 }} />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.name}</div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>Code: {record.code}</div>
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
            title: 'Level',
            dataIndex: 'level',
            key: 'level',
            sorter: (a, b) => a.level - b.level,
        },
        {
            title: 'Academic Year',
            dataIndex: 'academicYear',
            key: 'academicYear',
        },
        {
            title: 'Sections',
            key: 'sections',
            render: (_, record) => (
                <Space>
                    <Badge count={record.sections?.length || 0} showZero color="#1890ff" />
                    <Button
                        type="link"
                        size="small"
                        onClick={() => handleAddSection(record)}
                    >
                        Add Section
                    </Button>
                </Space>
            ),
        },
        {
            title: 'Students',
            key: 'students',
            render: (_, record) => {
                const total = record.sections?.reduce((sum, sec) => sum + (sec.currentStrength || 0), 0) || 0;
                return <Tag icon={<UserOutlined />}>{total}</Tag>;
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
                                key: 'sections',
                                icon: <TeamOutlined />,
                                label: 'Manage Sections',
                                onClick: () => handleAddSection(record),
                            },
                            { type: 'divider' },
                            {
                                key: 'delete',
                                icon: <DeleteOutlined />,
                                label: 'Delete',
                                danger: true,
                                onClick: () => {
                                    Modal.confirm({
                                        title: 'Delete Class',
                                        content: 'Are you sure you want to delete this class?',
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

    const expandedRowRender = (record) => {
        if (!record.sections || record.sections.length === 0) {
            return <div style={{ padding: 16, textAlign: 'center', color: '#8c8c8c' }}>No sections added yet</div>;
        }

        return (
            <List
                dataSource={record.sections}
                renderItem={(section) => (
                    <List.Item>
                        <List.Item.Meta
                            title={`Section ${section.name}`}
                            description={
                                <Space split={<Divider type="vertical" />}>
                                    <span>Capacity: {section.capacity || 40}</span>
                                    <span>Current: {section.currentStrength || 0}</span>
                                    {section.classTeacher && <span>Teacher: {section.classTeacher}</span>}
                                </Space>
                            }
                        />
                    </List.Item>
                )}
            />
        );
    };

    return (
        <div className="fade-in">
            <PageHeader
                title="Classes & Sections"
                subtitle="Manage classes and their sections"
                breadcrumbs={[{ title: 'Academic' }, { title: 'Classes' }]}
                actions={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Add Class
                    </Button>
                }
            />

            {/* Statistics */}
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Total Classes"
                            value={stats.totalClasses}
                            prefix={<BookOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Total Sections"
                            value={stats.totalSections}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Total Students"
                            value={stats.totalStudents}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Table */}
            <Card style={{ borderRadius: 12 }}>
                <Table
                    columns={columns}
                    dataSource={classes}
                    loading={loading}
                    rowKey="_id"
                    expandable={{
                        expandedRowRender,
                        rowExpandable: (record) => record.sections && record.sections.length > 0,
                    }}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Create/Edit Class Modal */}
            <Modal
                title={editingClass ? 'Edit Class' : 'Create Class'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Class Name"
                                rules={[{ required: true, message: 'Please enter class name' }]}
                            >
                                <Input placeholder="e.g., Class 1, Grade 10" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="code"
                                label="Class Code"
                                rules={[{ required: true, message: 'Please enter class code' }]}
                            >
                                <Input placeholder="e.g., C1, G10" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="level"
                                label="Level"
                                rules={[{ required: true, message: 'Please enter level' }]}
                            >
                                <InputNumber min={1} max={20} style={{ width: '100%' }} placeholder="1-20" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="category"
                                label="Category"
                                rules={[{ required: true, message: 'Please select category' }]}
                            >
                                <Select placeholder="Select category">
                                    <Option value="pre-primary">Pre-Primary</Option>
                                    <Option value="primary">Primary</Option>
                                    <Option value="middle">Middle</Option>
                                    <Option value="secondary">Secondary</Option>
                                    <Option value="higher-secondary">Higher Secondary</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="academicYear"
                        label="Academic Year"
                        rules={[{ required: true, message: 'Please select academic year' }]}
                    >
                        <Select placeholder="Select academic year">
                            {academicYears.map((year) => (
                                <Option key={year._id} value={year.name}>
                                    {year.name} {year.isCurrent && '(Current)'}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit">
                                {editingClass ? 'Update' : 'Create'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Add Section Modal */}
            <Modal
                title={`Add Section to ${selectedClass?.name}`}
                open={sectionModalVisible}
                onCancel={() => {
                    setSectionModalVisible(false);
                    sectionForm.resetFields();
                }}
                footer={null}
                width={500}
            >
                <Form form={sectionForm} layout="vertical" onFinish={handleSectionSubmit}>
                    <Form.Item
                        name="name"
                        label="Section Name"
                        rules={[{ required: true, message: 'Please enter section name' }]}
                    >
                        <Input placeholder="e.g., A, B, C" />
                    </Form.Item>

                    <Form.Item
                        name="capacity"
                        label="Capacity"
                        rules={[{ required: true, message: 'Please enter capacity' }]}
                        initialValue={40}
                    >
                        <InputNumber min={1} max={100} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setSectionModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit">
                                Add Section
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
