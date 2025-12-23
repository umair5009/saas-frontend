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
    Input,
    Select,
    message,
    Popconfirm,
    Tag,
    Typography
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    FolderOutlined
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { libraryApi } from '@/lib/api';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

export default function CategoriesPage() {
    const router = useRouter();
    const [categories,] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await libraryApi.getCategories();
            console.log(data)
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            message.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingCategory(null);
        form.resetFields();
        setModalOpen(true);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        form.setFieldsValue({
            name: category.name,
            code: category.code,
            description: category.description,
            parentCategory: category.parentCategory?._id,
        });
        setModalOpen(true);
    };

    const handleSubmit = async (values) => {
        try {
            if (editingCategory) {
                await libraryApi.updateCategory(editingCategory._id, values);
                message.success('Category updated successfully');
            } else {
                await libraryApi.createCategory(values);
                message.success('Category created successfully');
            }
            setModalOpen(false);
            form.resetFields();
            fetchCategories();
        } catch (error) {
            message.error(error.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        try {
            // Note: Backend doesn't have delete endpoint, so we update isActive to false
            await libraryApi.updateCategory(id, { isActive: false });
            message.success('Category deleted successfully');
            fetchCategories();
        } catch (error) {
            message.error('Failed to delete category');
        }
    };

    const columns = [
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            width: 120,
            render: (code) => <Tag color="blue">{code}</Tag>,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
                <Space>
                    <FolderOutlined />
                    <Text strong>{name}</Text>
                </Space>
            ),
        },
        {
            title: 'Parent Category',
            dataIndex: ['parentCategory', 'name'],
            key: 'parentCategory',
            render: (name) => name || '-',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Books Count',
            dataIndex: 'booksCount',
            key: 'booksCount',
            width: 120,
            render: (count) => count || 0,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete category?"
                        description="This will hide the category from the system."
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="link"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="fade-in">
            <PageHeader
                title="Book Categories"
                subtitle="Manage library book categories and classifications"
                breadcrumbs={[
                    { title: 'Library', path: '/library' },
                    { title: 'Categories' },
                ]}
                backButton
                actions={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
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
                />
            </Card>

            <Modal
                title={editingCategory ? 'Edit Category' : 'Add Category'}
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
                >
                    <Form.Item
                        name="name"
                        label="Category Name"
                        rules={[{ required: true, message: 'Please enter category name' }]}
                    >
                        <Input placeholder="e.g., Science Fiction" />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        label="Category Code"
                        rules={[{ required: true, message: 'Please enter category code' }]}
                    >
                        <Input placeholder="e.g., SCI-FI" />
                    </Form.Item>

                    <Form.Item
                        name="parentCategory"
                        label="Parent Category"
                    >
                        <Select
                            placeholder="Select parent category (optional)"
                            allowClear
                        >
                            {categories
                                .filter(c => c._id !== editingCategory?._id)
                                .map(category => (
                                    <Option key={category._id} value={category._id}>
                                        {category.name}
                                    </Option>
                                ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Brief description of this category"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingCategory ? 'Update' : 'Create'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
