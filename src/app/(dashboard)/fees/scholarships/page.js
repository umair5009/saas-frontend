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
    DatePicker,
    Row,
    Col,
    message,
    Typography,
    Divider,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { feeApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function ScholarshipsPage() {
    const router = useRouter();
    const [scholarships, setScholarships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchScholarships();
    }, []);

    const fetchScholarships = async () => {
        setLoading(true);
        try {
            const data = await feeApi.getScholarships();
            if (data.success) {
                setScholarships(data.data);
            }
        } catch (error) {
            message.error('Failed to fetch scholarships');
        } finally {
            setLoading(false);
        }
    };

    const checkCodeUnique = async (code) => {
        // Only check if it's a new entry or code changed
        // This assumes frontend check, ideally backend handles unique constraint error
        const exists = scholarships.some(s => s.code === code && s._id !== editingId);
        if (exists) {
            return Promise.reject(new Error('Scholarship code must be unique'));
        }
        return Promise.resolve();
    };

    const handleSave = async (values) => {
        try {
            const payload = {
                ...values,
                validFrom: values.validity[0].toISOString(),
                validTo: values.validity[1].toISOString(),
            };
            delete payload.validity;

            if (editingId) {
                await feeApi.updateScholarship(editingId, payload);
                message.success('Scholarship updated successfully');
            } else {
                await feeApi.createScholarship(payload);
                message.success('Scholarship created successfully');
            }
            setModalVisible(false);
            form.resetFields();
            setEditingId(null);
            fetchScholarships();
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || 'Failed to save scholarship');
        }
    };

    const handleEdit = (record) => {
        setEditingId(record._id);
        form.setFieldsValue({
            ...record,
            validity: [dayjs(record.validFrom), dayjs(record.validTo)],
            eligibilityCriteria: {
                minAttendance: record.eligibilityCriteria?.minAttendance,
                minPercentage: record.eligibilityCriteria?.minPercentage,
                maxFamilyIncome: record.eligibilityCriteria?.maxFamilyIncome
            }
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await feeApi.deleteScholarship(id);
            message.success('Scholarship deleted successfully');
            fetchScholarships();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to delete scholarship');
        }
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
            render: (type) => <Tag color="blue">{type.toUpperCase()}</Tag>,
        },
        {
            title: 'Discount',
            key: 'discount',
            render: (_, record) => (
                <Text>
                    {record.discountValue}
                    {record.discountType === 'percentage' ? '%' : ' (Fixed)'}
                </Text>
            ),
        },
        {
            title: 'Validity',
            key: 'validity',
            render: (_, record) => (
                <div style={{ fontSize: 12 }}>
                    <div>From: {dayjs(record.validFrom).format('DD MMM YYYY')}</div>
                    <div>To: {dayjs(record.validTo).format('DD MMM YYYY')}</div>
                </div>
            ),
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
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record._id)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div className="fade-in">
            <PageHeader
                title="Scholarships"
                subtitle="Manage fee scholarships and concessions"
                breadcrumbs={[
                    { title: 'Fees', path: '/fees' },
                    { title: 'Scholarships' },
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
                        Add Scholarship
                    </Button>
                }
            />

            <Card style={{ borderRadius: 12 }}>
                <Table
                    columns={columns}
                    dataSource={scholarships}
                    loading={loading}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingId ? 'Edit Scholarship' : 'Add Scholarship'}
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
                        discountType: 'percentage',
                        type: 'merit',
                        applicableFeeTypes: ['all']
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Scholarship Name"
                                rules={[{ required: true, message: 'Please enter name' }]}
                            >
                                <Input placeholder="e.g. Merit Scholarship" />
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
                                <Input placeholder="e.g. MERIT-2025" style={{ textTransform: 'uppercase' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="type"
                                label="Type"
                                rules={[{ required: true }]}
                            >
                                <Select>
                                    <Option value="merit">Merit Based</Option>
                                    <Option value="need-based">Need Based</Option>
                                    <Option value="sports">Sports</Option>
                                    <Option value="staff-child">Staff Child</Option>
                                    <Option value="sibling">Sibling</Option>
                                    <Option value="special">Special</Option>
                                    <Option value="government">Government</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="validity"
                                label="Validity Period"
                                rules={[{ required: true }]}
                            >
                                <RangePicker style={{ width: '100%' }} />
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
                        <Col span={12}>
                            <Form.Item
                                name="discountValue"
                                label="Discount Value"
                                rules={[{ required: true }]}
                            >
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                    </Row>

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
                            <Option value="lab">Lab Fee</Option>
                            <Option value="transport">Transport Fee</Option>
                        </Select>
                    </Form.Item>

                    <Divider orientation="left">Eligibility Criteria</Divider>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name={['eligibilityCriteria', 'minAttendance']} label="Min Attendance (%)">
                                <InputNumber min={0} max={100} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name={['eligibilityCriteria', 'minPercentage']} label="Min Marks (%)">
                                <InputNumber min={0} max={100} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name={['eligibilityCriteria', 'maxFamilyIncome']} label="Max Family Income">
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit">
                            {editingId ? 'Update' : 'Create'} Scholarship
                        </Button>
                    </Space>
                </Form>
            </Modal>
        </div>
    );
}
