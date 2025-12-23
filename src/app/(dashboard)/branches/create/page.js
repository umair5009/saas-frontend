'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Form,
    Input,
    Select,
    Button,
    Card,
    Row,
    Col,
    message,
    Space,
    Divider,
} from 'antd';
import {
    BankOutlined,
    SaveOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { branchApi } from '@/lib/api';

const { Option } = Select;

export default function CreateBranchPage() {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await branchApi.create(values);
            message.success('Branch created successfully!');
            router.push('/branches');
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to create branch');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <PageHeader
                title="Add New Branch"
                subtitle="Register a new branch campus"
                breadcrumbs={[
                    { title: 'Branches', path: '/branches' },
                    { title: 'Create' },
                ]}
                backButton
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    status: 'active',
                    type: 'regional',
                }}
            >
                <Card style={{ borderRadius: 12 }}>
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="name"
                                label="Branch Name"
                                rules={[{ required: true, message: 'Please enter branch name' }]}
                            >
                                <Input prefix={<BankOutlined />} placeholder="e.g. Johar Town Campus" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="code"
                                label="Branch Code"
                                rules={[{ required: true, message: 'Please enter branch code' }]}
                            >
                                <Input placeholder="e.g. LHR-JT-01" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="type"
                                label="Branch Type"
                                rules={[{ required: true }]}
                            >
                                <Select>
                                    <Option value="main">Main Campus</Option>
                                    <Option value="regional">Regional Campus</Option>
                                    <Option value="franchise">Franchise</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="status"
                                label="Status"
                                rules={[{ required: true }]}
                            >
                                <Select>
                                    <Option value="active">Active</Option>
                                    <Option value="inactive">Inactive</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider>Contact Information</Divider>

                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="email"
                                label="Branch Email"
                                rules={[
                                    { required: true, message: 'Please enter email' },
                                    { type: 'email', message: 'Invalid email' },
                                ]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="branch@school.com" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="phone"
                                label="Branch Phone"
                                rules={[{ required: true, message: 'Please enter phone number' }]}
                            >
                                <Input prefix={<PhoneOutlined />} placeholder="+92 300 1234567" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider>Admin Credentials</Divider>

                    <Row gutter={24}>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="adminName"
                                label="Admin Name"
                                rules={[{ required: true, message: 'Please enter admin name' }]}
                            >
                                <Input placeholder="John Doe" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="adminEmail"
                                label="Admin Email"
                                rules={[
                                    { required: true, message: 'Please enter admin email' },
                                    { type: 'email', message: 'Invalid email' },
                                ]}
                            >
                                <Input placeholder="admin@branch.com" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="adminPassword"
                                label="Admin Password"
                                rules={[{ required: true, message: 'Please enter password' }]}
                            >
                                <Input.Password placeholder="********" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider>Address</Divider>

                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name={['address', 'street']}
                                label="Street Address"
                                rules={[{ required: true, message: 'Please enter street address' }]}
                            >
                                <Input prefix={<EnvironmentOutlined />} placeholder="Street 1, Block A" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item
                                name={['address', 'city']}
                                label="City"
                                rules={[{ required: true, message: 'Please enter city' }]}
                            >
                                <Input placeholder="Lahore" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item
                                name={['address', 'postalCode']}
                                label="Postal Code"
                            >
                                <Input placeholder="54000" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row justify="end" style={{ marginTop: 24 }}>
                        <Space>
                            <Button onClick={() => router.push('/branches')}>Cancel</Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                icon={<SaveOutlined />}
                            >
                                Create Branch
                            </Button>
                        </Space>
                    </Row>
                </Card>
            </Form>
        </div>
    );
}
