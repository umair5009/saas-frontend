'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    Row,
    Col,
    Button,
    Space,
    Typography,
    Table,
    Modal,
    Form,
    Input,
    Select,
    message,
    Tag,
    Popconfirm,
    Empty,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    AppstoreOutlined,
    SaveOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { inventoryApi } from '@/lib/api';

const { Title, Text } = Typography;
const { Option } = Select;

const DEPRECIATION_METHODS = [
    { value: 'straight-line', label: 'Straight Line' },
    { value: 'declining-balance', label: 'Declining Balance' },
    { value: 'none', label: 'None' },
];

export default function CategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form] = Form.useForm();

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const response = await inventoryApi.getCategories();
            if (response.success) {
                setCategories(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Show default categories if API fails
            setCategories([
                { _id: '1', name: 'Electronics', code: 'ELEC', depreciationMethod: 'straight-line', defaultUsefulLife: 5, isActive: true },
                { _id: '2', name: 'Furniture', code: 'FURN', depreciationMethod: 'straight-line', defaultUsefulLife: 10, isActive: true },
                { _id: '3', name: 'Stationery', code: 'STAT', depreciationMethod: 'none', defaultUsefulLife: 0, isActive: true },
                { _id: '4', name: 'Sports Equipment', code: 'SPRT', depreciationMethod: 'straight-line', defaultUsefulLife: 5, isActive: true },
                { _id: '5', name: 'Laboratory', code: 'LABS', depreciationMethod: 'straight-line', defaultUsefulLife: 8, isActive: true },
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Handle create/update category
    const handleSubmit = async (values) => {
        try {
            if (editingCategory) {
                await inventoryApi.updateCategory(editingCategory._id, values);
                message.success('Category updated successfully');
            } else {
                await inventoryApi.createCategory(values);
                message.success('Category created successfully');
            }
            setModalVisible(false);
            setEditingCategory(null);
            form.resetFields();
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            message.error(error.response?.data?.message || 'Failed to save category');
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        try {
            await inventoryApi.deleteCategory(id);
            message.success('Category deleted successfully');
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            message.error(error.response?.data?.message || 'Failed to delete category');
        }
    };

    // Open modal for editing
    const openEditModal = (category) => {
        setEditingCategory(category);
        form.setFieldsValue(category);
        setModalVisible(true);
    };

    // Open modal for creating
    const openCreateModal = () => {
        setEditingCategory(null);
        form.resetFields();
        setModalVisible(true);
    };

    // Table columns
    const columns = [
        {
            title: 'Category Name',
            dataIndex: 'name',
            key: 'name',
            render: (name) => <Text strong>{name}</Text>,
        },
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            render: (code) => <Tag color="blue">{code}</Tag>,
        },
        {
            title: 'Depreciation Method',
            dataIndex: 'depreciationMethod',
            key: 'depreciationMethod',
            render: (method) => {
                const label = DEPRECIATION_METHODS.find(m => m.value === method)?.label || method;
                return <Tag>{label}</Tag>;
            },
        },
        {
            title: 'Default Useful Life',
            dataIndex: 'defaultUsefulLife',
            key: 'defaultUsefulLife',
            render: (years) => years ? `${years} years` : '-',
        },
        {
            title: 'Depreciation Rate',
            dataIndex: 'defaultDepreciationRate',
            key: 'defaultDepreciationRate',
            render: (rate) => rate ? `${rate}%` : '-',
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag color={isActive ? 'success' : 'default'}>
                    {isActive ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => openEditModal(record)}
                    />
                    <Popconfirm
                        title="Delete Category"
                        description="Are you sure you want to delete this category?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Delete"
                        okType="danger"
                        cancelText="Cancel"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="fade-in">
            <PageHeader
                title="Inventory Categories"
                subtitle="Manage asset categories and depreciation settings"
                breadcrumbs={[
                    { title: 'Inventory', path: '/inventory' },
                    { title: 'Categories' },
                ]}
                backButton
                actions={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={openCreateModal}
                    >
                        Add Category
                    </Button>
                }
            />

            <Card style={{ borderRadius: 12 }}>
                <Table
                    columns={columns}
                    dataSource={categories}
                    loading={loading}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                    locale={{
                        emptyText: <Empty description="No categories found" />,
                    }}
                />
            </Card>

            {/* Category Modal */}
            <Modal
                title={
                    <Space>
                        <AppstoreOutlined />
                        {editingCategory ? 'Edit Category' : 'Add Category'}
                    </Space>
                }
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingCategory(null);
                    form.resetFields();
                }}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        depreciationMethod: 'straight-line',
                        defaultUsefulLife: 5,
                        defaultDepreciationRate: 20,
                        isActive: true,
                    }}
                >
                    <Form.Item
                        name="name"
                        label="Category Name"
                        rules={[{ required: true, message: 'Please enter category name' }]}
                    >
                        <Input placeholder="e.g., Electronics, Furniture" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        label="Category Code"
                        rules={[{ required: true, message: 'Please enter category code' }]}
                    >
                        <Input placeholder="e.g., ELEC, FURN" size="large" style={{ textTransform: 'uppercase' }} />
                    </Form.Item>

                    <Form.Item
                        name="depreciationMethod"
                        label="Depreciation Method"
                    >
                        <Select size="large">
                            {DEPRECIATION_METHODS.map(method => (
                                <Option key={method.value} value={method.value}>{method.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="defaultUsefulLife"
                                label="Default Useful Life (Years)"
                            >
                                <Input type="number" min={1} max={50} size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="defaultDepreciationRate"
                                label="Default Depreciation Rate (%)"
                            >
                                <Input type="number" min={0} max={100} size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={2} placeholder="Category description" />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                                {editingCategory ? 'Update' : 'Create'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
