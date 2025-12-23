'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    Input,
    Select,
    InputNumber,
    Row,
    Col,
    message,
    Typography,
    Switch,
    Divider,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { feeApi } from '@/lib/api';

const { Title, Text } = Typography;
const { Option } = Select;

export default function DiscountRulesPage() {
    const router = useRouter();
    const [discountRules, setDiscountRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchDiscountRules();
    }, []);

    const fetchDiscountRules = async () => {
        setLoading(true);
        try {
            const data = await feeApi.getDiscountRules();
            if (data.success) {
                setDiscountRules(data.data);
            }
        } catch (error) {
            message.error('Failed to fetch discount rules');
        } finally {
            setLoading(false);
        }
    };

    const checkCodeUnique = async (code) => {
        const exists = discountRules.some(d => d.code === code && d._id !== editingId);
        if (exists) {
            return Promise.reject(new Error('Discount code must be unique'));
        }
        return Promise.resolve();
    };

    const handleSave = async (values) => {
        try {
            const payload = { ...values };

            if (editingId) {
                await feeApi.updateDiscountRule(editingId, payload);
                message.success('Discount rule updated successfully');
            } else {
                await feeApi.createDiscountRule(payload);
                message.success('Discount rule created successfully');
            }
            setModalVisible(false);
            form.resetFields();
            setEditingId(null);
            fetchDiscountRules();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to save discount rule');
        }
    };

    const handleEdit = (record) => {
        setEditingId(record._id);
        form.setFieldsValue({
            ...record,
            conditions: {
                paymentBeforeDays: record.conditions?.paymentBeforeDays,
                siblingCount: record.conditions?.siblingCount,
                minimumAmount: record.conditions?.minimumAmount,
                referralCount: record.conditions?.referralCount
            }
        });
        setModalVisible(true);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <Text strong>{text}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>Code: {record.code}</Text>
                </div>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <Tag color="cyan">{type.toUpperCase()}</Tag>,
        },
        {
            title: 'Value',
            key: 'value',
            render: (_, record) => (
                <Text>
                    {record.discountValue}
                    {record.discountType === 'percentage' ? '%' : ' (Fixed)'}
                </Text>
            ),
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
        },
        {
            title: 'Stackable',
            dataIndex: 'isStackable',
            key: 'isStackable',
            render: (val) => val ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>,
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag color={isActive ? 'success' : 'error'}>
                    {isActive ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                >
                    Edit
                </Button>
            ),
        },
    ];

    return (
        <div className="fade-in">
            <PageHeader
                title="Discount Rules"
                subtitle="Manage rules for automatic fee discounts"
                breadcrumbs={[
                    { title: 'Fees', path: '/fees' },
                    { title: 'Discounts' },
                ]}
                backButton
                actions={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingId(null);
                            form.resetFields();
                            setModalVisible(true);
                        }}
                    >
                        Add Discount Rule
                    </Button>
                }
            />

            <Card style={{ borderRadius: 12 }}>
                <Table
                    columns={columns}
                    dataSource={discountRules}
                    loading={loading}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingId ? 'Edit Discount Rule' : 'Add Discount Rule'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    initialValues={{
                        isActive: true,
                        isStackable: false,
                        priority: 0,
                        discountType: 'percentage',
                        type: 'early-payment',
                        applicableFeeTypes: ['all']
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Rule Name"
                                rules={[{ required: true, message: 'Please enter name' }]}
                            >
                                <Input placeholder="e.g. Early Bird Discount" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="code"
                                label="Code"
                                rules={[
                                    { required: true, message: 'Please enter unique code' },
                                    { validator: (_, value) => checkCodeUnique(value) }
                                ]}
                            >
                                <Input placeholder="e.g. EARLY-BIRD" style={{ textTransform: 'uppercase' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="type"
                                label="Discount Logic Type"
                                rules={[{ required: true }]}
                            >
                                <Select>
                                    <Option value="early-payment">Early Payment</Option>
                                    <Option value="sibling">Sibling Discount</Option>
                                    <Option value="bulk-payment">Bulk Payment</Option>
                                    <Option value="referral">Referral</Option>
                                    <Option value="promotional">Promotional</Option>
                                    <Option value="loyalty">Loyalty</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="applicableFeeTypes"
                                label="Applicable Fee Types"
                                rules={[{ required: true }]}
                            >
                                <Select mode="multiple" placeholder="Select fee types">
                                    <Option value="all">All Fees</Option>
                                    <Option value="tuition">Tuition Fee</Option>
                                    <Option value="admission">Admission Fee</Option>
                                    <Option value="exam">Exam Fee</Option>
                                    <Option value="transport">Transport Fee</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="discountType"
                                label="Discount Type"
                                rules={[{ required: true }]}
                            >
                                <Select>
                                    <Option value="percentage">Percentage (%)</Option>
                                    <Option value="fixed">Fixed Amount</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name="discountValue"
                                label="Value"
                                rules={[{ required: true }]}
                            >
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name="maxDiscountAmount"
                                label="Max Cap"
                            >
                                <InputNumber style={{ width: '100%' }} min={0} placeholder="No Limit" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">Conditions</Divider>

                    <Form.Item
                        noStyle
                        shouldUpdate={(prev, curr) => prev.type !== curr.type}
                    >
                        {({ getFieldValue }) => {
                            const type = getFieldValue('type');
                            return (
                                <Row gutter={16}>
                                    {type === 'early-payment' && (
                                        <Col span={12}>
                                            <Form.Item name={['conditions', 'paymentBeforeDays']} label="Days Before Due Date">
                                                <InputNumber style={{ width: '100%' }} min={1} />
                                            </Form.Item>
                                        </Col>
                                    )}
                                    {type === 'sibling' && (
                                        <Col span={12}>
                                            <Form.Item name={['conditions', 'siblingCount']} label="Min Sibling Count">
                                                <InputNumber style={{ width: '100%' }} min={1} />
                                            </Form.Item>
                                        </Col>
                                    )}
                                    <Col span={12}>
                                        <Form.Item name={['conditions', 'minimumAmount']} label="Min Invoice Amount">
                                            <InputNumber style={{ width: '100%' }} min={0} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            );
                        }}
                    </Form.Item>

                    <Divider />

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="priority" label="Priority (Higher applies first)">
                                <InputNumber min={0} defaultValue={0} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="isStackable" label="Stackable" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="isActive" label="Active" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit">
                            {editingId ? 'Update' : 'Create'} Rule
                        </Button>
                    </Space>
                </Form>
            </Modal>
        </div>
    );
}
