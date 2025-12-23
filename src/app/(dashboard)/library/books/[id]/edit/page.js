'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Card,
    Form,
    Input,
    InputNumber,
    Button,
    Select,
    Row,
    Col,
    Upload,
    message,
    Space,
    Divider,
    Typography,
    Spin,
    Modal,
    Table,
    Tag
} from 'antd';
import {
    UploadOutlined,
    SaveOutlined,
    PlusOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { libraryApi, uploadApi } from '@/lib/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function EditBookPage() {
    const router = useRouter();
    const params = useParams();
    const bookId = params.id;

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [book, setBook] = useState(null);
    const [categories, setCategories] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [copiesModalOpen, setCopiesModalOpen] = useState(false);
    const [addingCopies, setAddingCopies] = useState(false);

    useEffect(() => {
        fetchBook();
        fetchCategories();
    }, [bookId]);

    const fetchBook = async () => {
        setLoading(true);
        try {
            const data = await libraryApi.getBook(bookId);
            if (data.success) {
                setBook(data.data);
                form.setFieldsValue({
                    title: data.data.title,
                    author: data.data.author,
                    isbn: data.data.isbn,
                    category: data.data.category?._id,
                    publisher: data.data.publisher,
                    publicationYear: data.data.publicationYear,
                    language: data.data.language,
                    edition: data.data.edition,
                    pages: data.data.pages,
                    price: data.data.price,
                    shelf: data.data.shelf,
                    rack: data.data.rack,
                    section: data.data.section,
                    description: data.data.description,
                });

                if (data.data.coverImage) {
                    setFileList([{
                        uid: '-1',
                        name: 'cover.jpg',
                        status: 'done',
                        url: data.data.coverImage,
                    }]);
                }
            }
        } catch (error) {
            message.error('Failed to fetch book details');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await libraryApi.getCategories();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories');
        }
    };

    const handleUpload = async ({ file, onSuccess, onError }) => {
        try {
            const data = await uploadApi.uploadFile(file);
            onSuccess(data, file);
            message.success('Image uploaded successfully');
        } catch (error) {
            onError(error);
            message.error('Upload failed');
        }
    };

    const onFinish = async (values) => {
        setSaving(true);
        try {
            const payload = {
                ...values,
                coverImage: fileList.length > 0 && fileList[0].response?.url
                    ? fileList[0].response.url
                    : book.coverImage,
            };

            const data = await libraryApi.updateBook(bookId, payload);

            if (data.success) {
                message.success('Book updated successfully');
                router.push(`/library/books/${bookId}`);
            }
        } catch (error) {
            message.error(error.message || 'Failed to update book');
        } finally {
            setSaving(false);
        }
    };

    const handleAddCopies = async (values) => {

        console.log(values)
        setAddingCopies(true);
        try {
            await libraryApi.addBookCopies(bookId, { copies: values.numberOfCopies });
            message.success(`${values.numberOfCopies} copies added successfully`);
            setCopiesModalOpen(false);
            fetchBook();
        } catch (error) {
            message.error('Failed to add copies');
        } finally {
            setAddingCopies(false);
        }
    };

    const uploadProps = {
        customRequest: handleUpload,
        onChange: ({ fileList: newFileList }) => setFileList(newFileList),
        fileList,
        maxCount: 1,
        listType: 'picture',
    };

    const copiesColumns = [
        {
            title: 'Copy #',
            dataIndex: 'copyNumber',
            key: 'copyNumber',
            width: 80,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = {
                    available: 'success',
                    issued: 'processing',
                    lost: 'error',
                    damaged: 'warning',
                };
                return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Condition',
            dataIndex: 'condition',
            key: 'condition',
            render: (condition) => {
                const colors = {
                    new: 'success',
                    good: 'success',
                    fair: 'warning',
                    poor: 'error',
                };
                return <Tag color={colors[condition]}>{condition.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Purchase Date',
            dataIndex: 'purchaseDate',
            key: 'purchaseDate',
            render: (date) => date ? new Date(date).toLocaleDateString() : '-',
        },
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="fade-in">
            <PageHeader
                title="Edit Book"
                subtitle={`Editing: ${book?.title}`}
                breadcrumbs={[
                    { title: 'Library', path: '/library' },
                    { title: 'Books', path: '/library' },
                    { title: book?.title, path: `/library/books/${bookId}` },
                    { title: 'Edit' },
                ]}
                backButton
            />

            <Card style={{ borderRadius: 12, marginBottom: 24 }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Row gutter={24}>
                        <Col xs={24} md={16}>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        name="title"
                                        label="Book Title"
                                        rules={[{ required: true, message: 'Title is required' }]}
                                    >
                                        <Input placeholder="e.g. Introduction to Physics" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="author"
                                        label="Author"
                                        rules={[{ required: true, message: 'Author is required' }]}
                                    >
                                        <Input placeholder="Author Name" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="isbn" label="ISBN">
                                        <Input placeholder="ISBN" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="category"
                                        label="Category"
                                        rules={[{ required: true, message: 'Category is required' }]}
                                    >
                                        <Select placeholder="Select Category" showSearch optionFilterProp="children">
                                            {categories.map(c => (
                                                <Option key={c._id} value={c._id}>{c.name}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="publisher" label="Publisher">
                                        <Input placeholder="Publisher Name" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="publicationYear" label="Publication Year">
                                        <InputNumber style={{ width: '100%' }} min={1900} max={new Date().getFullYear()} />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="language" label="Language">
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="edition" label="Edition">
                                        <Input placeholder="e.g. 2nd Edition" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="pages" label="Pages">
                                        <InputNumber style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="price" label="Price">
                                        <InputNumber style={{ width: '100%' }} prefix="Rs." />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Divider orientation="left">Location</Divider>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="shelf" label="Shelf">
                                        <Input placeholder="e.g. A-1" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="rack" label="Rack">
                                        <Input placeholder="e.g. R-5" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="section" label="Section">
                                        <Input placeholder="e.g. Science" />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="description" label="Description">
                                        <TextArea rows={3} placeholder="Brief description of the book" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>

                        <Col xs={24} md={8}>
                            <Card type="inner" title="Cover Image" style={{ marginBottom: 24 }}>
                                <Form.Item>
                                    <Upload {...uploadProps}>
                                        <Button icon={<UploadOutlined />}>Click to Upload</Button>
                                    </Upload>
                                </Form.Item>
                            </Card>

                            <Card type="inner" title="Copies Management">
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Text>Total Copies: <strong>{book?.totalCopies || 0}</strong></Text>
                                    <Text>Available: <strong>{book?.availableCopies || 0}</strong></Text>
                                    <Button
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                        onClick={() => setCopiesModalOpen(true)}
                                        block
                                    >
                                        Add More Copies
                                    </Button>
                                </Space>
                            </Card>
                        </Col>
                    </Row>

                    <Divider />

                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Space>
                            <Button onClick={() => router.back()}>Cancel</Button>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                                Save Changes
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            {book && (
                <Card title="Book Copies" style={{ borderRadius: 12 }}>
                    <Table
                        columns={copiesColumns}
                        dataSource={book.copies}
                        rowKey="copyNumber"
                        pagination={{ pageSize: 10 }}
                    />
                </Card>
            )}

            <Modal
                title="Add Book Copies"
                open={copiesModalOpen}
                onCancel={() => setCopiesModalOpen(false)}
                footer={null}
            >
                <Form onFinish={handleAddCopies} layout="vertical">
                    <Form.Item
                        name="numberOfCopies"
                        label="Number of Copies to Add"
                        rules={[{ required: true, message: 'Please enter number of copies' }]}
                        initialValue={1}
                    >
                        <InputNumber min={1} max={500} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setCopiesModalOpen(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={addingCopies}>
                                Add Copies
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
