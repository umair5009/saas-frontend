'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    Form,
    Input,
    Select,
    Button,
    Row,
    Col,
    Space,
    message,
    Typography,
    Divider,
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { branchApi } from '@/lib/api';

const { Title } = Typography;
const { Option } = Select;

export default function EditBranchPage({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const branchId = resolvedParams.id;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchBranch();
    }, [branchId]);

    const fetchBranch = async () => {
        try {
            // Use getById
            const response = await branchApi.getById(branchId);
            const branch = response.data;

            form.setFieldsValue({
                ...branch,
                street: branch.address?.street,
                city: branch.address?.city,
                state: branch.address?.state,
                postalCode: branch.address?.postalCode,
                country: branch.address?.country,
            });
        } catch (error) {
            message.error('Failed to fetch branch details');
        } finally {
            setFetching(false);
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
                address: {
                    street: values.street,
                    city: values.city,
                    state: values.state,
                    postalCode: values.postalCode,
                    country: values.country || 'Pakistan',
                }
            };

            delete payload.street;
            delete payload.city;
            delete payload.state;
            delete payload.postalCode;
            delete payload.country;

            await branchApi.update(branchId, payload);
            message.success('Branch updated successfully');
            router.push(`/branches/${branchId}`);
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to update branch');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <Card loading />;

    return (
        <div className="fade-in">
            <PageHeader
                title="Edit Branch"
                breadcrumbs={[
                    { title: 'Branches', href: '/branches' },
                    { title: 'Edit Branch' },
                ]}
                actions={
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                }
            />

            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ status: 'active', country: 'Pakistan' }}
                >
                    <Row gutter={24}>
                        {/* Basic Info */}
                        <Col span={24}>
                            <Title level={5}>Basic Information</Title>
                            <Divider style={{ margin: '12px 0 24px' }} />
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="name"
                                label="Branch Name"
                                rules={[{ required: true, message: 'Please enter branch name' }]}
                            >
                                <Input placeholder="e.g. Main Campus" size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="code"
                                label="Branch Code"
                                rules={[{ required: true, message: 'Please enter branch code' }]}
                            >
                                <Input placeholder="e.g. BR-001" size="large" disabled />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="type"
                                label="Branch Type"
                            >
                                <Select disabled>
                                    <Option value="main">Main Branch</Option>
                                    <Option value="regional">Regional Campus</Option>
                                    <Option value="franchise">Franchise</Option>
                                    <Option value="satellite">Satellite</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="status" label="Status">
                                <Select>
                                    <Option value="active">Active</Option>
                                    <Option value="inactive">Inactive</Option>
                                    <Option value="suspended">Suspended</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        {/* Contact Info */}
                        <Col span={24}>
                            <Title level={5} style={{ marginTop: 12 }}>Contact Information</Title>
                            <Divider style={{ margin: '12px 0 24px' }} />
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true },
                                    { type: 'email', message: 'Please enter a valid email' }
                                ]}
                            >
                                <Input placeholder="branch@school.com" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="phone"
                                label="Phone"
                                rules={[{ required: true }]}
                            >
                                <Input placeholder="+92 300 1234567" />
                            </Form.Item>
                        </Col>

                        {/* Address */}
                        <Col span={24}>
                            <Title level={5} style={{ marginTop: 12 }}>Address</Title>
                            <Divider style={{ margin: '12px 0 24px' }} />
                        </Col>

                        <Col xs={24} md={24}>
                            <Form.Item
                                name="street"
                                label="Street Address"
                            >
                                <Input placeholder="123 Education Ave" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="city"
                                label="City"
                                rules={[{ required: true }]}
                            >
                                <Input placeholder="Lahore" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="state" label="State/Province">
                                <Input placeholder="Punjab" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="country" label="Country">
                                <Input placeholder="Pakistan" />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
                                <Space>
                                    <Button onClick={() => router.back()}>Cancel</Button>
                                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} size="large">
                                        Update Branch
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
}
