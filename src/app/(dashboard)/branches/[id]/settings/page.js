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
    Tabs,
    InputNumber,
    TimePicker
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { branchApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

export default function BranchSettingsPage({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const branchId = resolvedParams.id;
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [branch, setBranch] = useState(null);

    useEffect(() => {
        fetchBranch();
    }, [branchId]);

    const fetchBranch = async () => {
        try {
            const response = await branchApi.getById(branchId);
            setBranch(response.data);
        } catch (error) {
            message.error('Failed to fetch branch settings');
        } finally {
            setFetching(false);
        }
    };

    const handleUpdate = async (section, values) => {
        setLoading(true);
        try {
            await branchApi.updateSettings(branchId, section, values);
            message.success(`${section} settings updated`);
        } catch (error) {
            message.error(`Failed to update ${section} settings`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <Card loading />;

    const AcademicSettings = () => {
        const [form] = Form.useForm();
        return (
            <Form
                form={form}
                layout="vertical"
                initialValues={branch?.academicConfig}
                onFinish={(vals) => handleUpdate('academicConfig', vals)}
            >
                <Title level={5}>Academic Configuration</Title>
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item name="currentAcademicYear" label="Current Academic Year">
                            <Input placeholder="2024-2025" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="curriculum" label="Curriculum">
                            <Select>
                                <Option value="matric">Matric</Option>
                                <Option value="cambridge">Cambridge (O/A Level)</Option>
                                <Option value="ib">IB</Option>
                                <Option value="other">Other</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>Save Academic Settings</Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        );
    };

    const FinancialSettings = () => {
        const [form] = Form.useForm();
        return (
            <Form
                form={form}
                layout="vertical"
                initialValues={branch?.financialSettings}
                onFinish={(vals) => handleUpdate('financialSettings', vals)}
            >
                <Title level={5}>Financial Settings</Title>
                <Row gutter={24}>
                    <Col span={8}>
                        <Form.Item name="currency" label="Currency">
                            <Input placeholder="PKR" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="taxId" label="Tax ID / NTN">
                            <Input placeholder="NTN-1234567" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>Save Financial Settings</Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        );
    };

    const OperationalSettings = () => {
        const [form] = Form.useForm();
        const initVals = {
            ...branch?.operationalSettings,
            schoolTiming: {
                startTime: branch?.operationalSettings?.schoolTiming?.startTime ? dayjs(branch?.operationalSettings?.schoolTiming?.startTime, 'HH:mm') : null,
                endTime: branch?.operationalSettings?.schoolTiming?.endTime ? dayjs(branch?.operationalSettings?.schoolTiming?.endTime, 'HH:mm') : null,
            }
        };

        const handleOpFinish = (values) => {
            const payload = {
                ...values,
                schoolTiming: {
                    startTime: values.schoolTiming?.startTime?.format('HH:mm'),
                    endTime: values.schoolTiming?.endTime?.format('HH:mm'),
                }
            };
            handleUpdate('operationalSettings', payload);
        };

        return (
            <Form
                form={form}
                layout="vertical"
                initialValues={initVals}
                onFinish={handleOpFinish}
            >
                <Title level={5}>Operational Settings</Title>
                <Row gutter={24}>
                    <Col span={8}>
                        <Form.Item name={['schoolTiming', 'startTime']} label="School Start Time">
                            <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name={['schoolTiming', 'endTime']} label="School End Time">
                            <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="periodsPerDay" label="Periods Per Day">
                            <InputNumber min={1} max={15} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>Save Operational Settings</Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        );
    };

    return (
        <div className="fade-in">
            <PageHeader
                title="Branch Settings"
                breadcrumbs={[
                    { title: 'Branches', href: '/branches' },
                    { title: branch?.name, href: `/branches/${branchId}` },
                    { title: 'Settings' },
                ]}
                actions={
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => router.push(`/branches/${branchId}`)}
                    >
                        Back to Branch
                    </Button>
                }
            />

            <Card>
                <Tabs
                    tabPosition="left"
                    items={[
                        { label: 'Academic', key: 'academic', children: <AcademicSettings /> },
                        { label: 'Financial', key: 'financial', children: <FinancialSettings /> },
                        { label: 'Operational', key: 'operational', children: <OperationalSettings /> },
                    ]}
                />
            </Card>
        </div>
    );
}
