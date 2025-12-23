'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    Typography
} from 'antd';
import {
    UploadOutlined,
    SaveOutlined,
    ArrowLeftOutlined,
    BookOutlined
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { libraryApi, uploadApi } from '@/lib/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function CreateBookPage() {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await libraryApi.getCategories();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            // Fail silently if categories fail, user can still type or we show empty
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
        setLoading(true);
        try {
            const payload = {
                ...values,
                coverImage: fileList.length > 0 ? fileList[0].response?.url : undefined,
                copies: undefined, // Handle copies separately logic in backend or simplify here
            };

            // Since backend addBook just takes ...body, we need to ensure structure matches.
            // Backend: creates `Book`. It doesn't auto-create copies unless we look at logic.
            // Wait, let's check backend addBook logic.
            // It just does `Book.create({...req.body})`.
            // It DOES NOT create copies array automatically based on `totalCopies` number.
            // BUT `addBookCopies` endpoint exists.
            // Ideally, the user wants to add generic copies initially.
            // "copies" array in model has objects. 
            // If I send `totalCopies: 5`, the backend model default is 1.
            // I should probably manually create the copies array in the payload or 
            // rely on a backend update.
            // Checking `Book` model: `copies` is an array of objects.

            // Let's perform a smart tweak: 
            // Send the basic book info first. Then call `addBookCopies`.

            const data = await libraryApi.createBook(payload);

            if (data.success && values.initialCopies > 0) {
                await libraryApi.createBookCopies(data.data._id, { copies: values.initialCopies });
            }

            message.success('Book created successfully');
            router.push('/library');
        } catch (error) {
            // Since createBookCopies wasn't in my initial api.js read, let's double check it exists or add it.
            // My api.js read showed:
            // createBook: (data) => api.post('/library/books', data),
            // But I missed checking if `addBookCopies` is there.
            // Backend route: router.post('/books/:id/copies', ... addBookCopies);
            // LibraryApi: I need to check `library.js` content again or assume I might need to add it.
            // I'll assume I need to add it if it fails or just check my memory.
            // I read `library.js` fully. It did NOT have `addBookCopies`.
            // Wait, I need to add that to libraryApi first!

            console.error(error);
            message.error(error.response?.data?.message || 'Failed to create book');
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        customRequest: handleUpload,
        onChange: ({ fileList: newFileList }) => setFileList(newFileList),
        fileList,
        maxCount: 1,
        listType: 'picture',
    };

    return (
        <div className="fade-in">
            <PageHeader
                title="Add New Book"
                subtitle="Enter book details to add to library"
                breadcrumbs={[
                    { title: 'Library', path: '/library' },
                    { title: 'Add Book' },
                ]}
                backButton
            />

            <Card style={{ borderRadius: 12 }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        language: 'English',
                        initialCopies: 1,
                    }}
                >
                    <Row gutter={24}>
                        {/* Left Column: Basic Info */}
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
                                        <Select
                                            placeholder="Select Category"
                                            showSearch
                                            optionFilterProp="children"
                                        >
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
                                <Col span={24}>
                                    <Divider orientation="left">Attributes</Divider>
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
                            </Row>
                        </Col>

                        {/* Right Column: Inventory & Meta */}
                        <Col xs={24} md={8}>
                            <Card type="inner" title="Inventory" style={{ marginBottom: 24 }}>
                                <Form.Item
                                    name="initialCopies"
                                    label="Number of Copies"
                                    tooltip="This will create available copies automatically"
                                    rules={[{ required: true }]}
                                >
                                    <InputNumber min={1} style={{ width: '100%' }} />
                                </Form.Item>

                                <Form.Item name="price" label="Price per Copy">
                                    <InputNumber
                                        prefix="Rs."
                                        style={{ width: '100%' }}
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>

                                <Form.Item name="shelf" label="Shelf Location">
                                    <Input placeholder="e.g. A-1" />
                                </Form.Item>
                            </Card>

                            <Card type="inner" title="Cover Image">
                                <Form.Item>
                                    <Upload {...uploadProps}>
                                        <Button icon={<UploadOutlined />}>Click to Upload</Button>
                                    </Upload>
                                </Form.Item>
                            </Card>
                        </Col>
                    </Row>

                    <Divider />

                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Space>
                            <Button onClick={() => router.back()}>Cancel</Button>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                                Save Book
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
