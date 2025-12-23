'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    Form,
    InputNumber,
    Button,
    message,
    Space,
    Divider,
    Typography,
    Spin,
    Row,
    Col,
    Switch
} from 'antd';
import {
    SaveOutlined,
    SettingOutlined
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { libraryApi } from '@/lib/api';

const { Title, Text } = Typography;

export default function LibrarySettingsPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await libraryApi.getLibrarySettings();
            if (data.success && data.data) {
                form.setFieldsValue({
                    // Student Issue Rules
                    studentMaxBooks: data.data.issueRules?.student?.maxBooks || 3,
                    studentMaxDays: data.data.issueRules?.student?.maxDays || 14,
                    studentRenewLimit: data.data.issueRules?.student?.maxRenewals || 2,

                    // Staff Issue Rules
                    staffMaxBooks: data.data.issueRules?.staff?.maxBooks || 5,
                    staffMaxDays: data.data.issueRules?.staff?.maxDays || 30,
                    staffRenewLimit: data.data.issueRules?.staff?.maxRenewals || 3,

                    // Fine Rules
                    fineEnabled: data.data.fineRules?.isEnabled !== false,
                    finePerDay: data.data.fineRules?.finePerDay || 5,
                    maxFineAmount: data.data.fineRules?.maxFine || 500,
                    gracePeriodDays: data.data.fineRules?.gracePeriodDays || 0,

                    // Reservation Rules
                    reservationEnabled: data.data.reservationRules?.isEnabled !== false,
                    reservationExpiryDays: data.data.reservationRules?.reservationExpiryDays || 3,
                    maxActiveReservations: data.data.reservationRules?.maxReservationsPerMember || 3,

                    // General Settings
                    allowSelfCheckout: data.data.allowSelfCheckout || false,
                    requireApprovalForRenewal: data.data.requireApprovalForRenewal || false,
                });
            }
        } catch (error) {
            message.error('Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values) => {
        setSaving(true);
        try {
            const payload = {
                issueRules: {
                    student: {
                        maxBooks: values.studentMaxBooks,
                        maxDays: values.studentMaxDays,
                        maxRenewals: values.studentRenewLimit,
                    },
                    staff: {
                        maxBooks: values.staffMaxBooks,
                        maxDays: values.staffMaxDays,
                        maxRenewals: values.staffRenewLimit,
                    },
                },
                fineRules: {
                    isEnabled: values.fineEnabled,
                    finePerDay: values.finePerDay,
                    maxFine: values.maxFineAmount,
                    gracePeriodDays: values.gracePeriodDays,
                },
                reservationRules: {
                    isEnabled: values.reservationEnabled,
                    reservationExpiryDays: values.reservationExpiryDays,
                    maxReservationsPerMember: values.maxActiveReservations,
                },
                allowSelfCheckout: values.allowSelfCheckout,
                requireApprovalForRenewal: values.requireApprovalForRenewal,
            };

            await libraryApi.updateLibrarySettings(payload);
            message.success('Settings updated successfully');
        } catch (error) {
            message.error(error.message || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

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
                title="Library Settings"
                subtitle="Configure library rules, loan periods, and fine rates"
                breadcrumbs={[
                    { title: 'Library', path: '/library' },
                    { title: 'Settings' },
                ]}
                backButton
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Row gutter={24}>
                    <Col xs={24} lg={12}>
                        <Card
                            title={
                                <Space>
                                    <SettingOutlined />
                                    <span>Student Issue Rules</span>
                                </Space>
                            }
                            style={{ borderRadius: 12, marginBottom: 24 }}
                        >
                            <Form.Item
                                name="studentMaxBooks"
                                label="Maximum Books"
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <InputNumber
                                    min={1}
                                    max={10}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="studentMaxDays"
                                label="Maximum Loan Period"
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <InputNumber
                                    min={1}
                                    max={90}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="studentRenewLimit"
                                label="Renewal Limit"
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <InputNumber
                                    min={0}
                                    max={5}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Card>

                        <Card
                            title={
                                <Space>
                                    <SettingOutlined />
                                    <span>Fine Configuration</span>
                                </Space>
                            }
                            style={{ borderRadius: 12 }}
                        >
                            <Form.Item
                                name="fineEnabled"
                                label="Enable Fines"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>

                            <Form.Item
                                name="finePerDay"
                                label="Fine Per Day (Rs.)"
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="maxFineAmount"
                                label="Maximum Fine Amount (Rs.)"
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="gracePeriodDays"
                                label="Grace Period (days)"
                                tooltip="Number of days before fines start accumulating"
                            >
                                <InputNumber
                                    min={0}
                                    max={7}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Card
                            title={
                                <Space>
                                    <SettingOutlined />
                                    <span>Staff Issue Rules</span>
                                </Space>
                            }
                            style={{ borderRadius: 12, marginBottom: 24 }}
                        >
                            <Form.Item
                                name="staffMaxBooks"
                                label="Maximum Books"
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <InputNumber
                                    min={1}
                                    max={20}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="staffMaxDays"
                                label="Maximum Loan Period"
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <InputNumber
                                    min={1}
                                    max={180}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="staffRenewLimit"
                                label="Renewal Limit"
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <InputNumber
                                    min={0}
                                    max={10}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Card>

                        <Card
                            title={
                                <Space>
                                    <SettingOutlined />
                                    <span>Reservation Rules</span>
                                </Space>
                            }
                            style={{ borderRadius: 12, marginBottom: 24 }}
                        >
                            <Form.Item
                                name="reservationEnabled"
                                label="Enable Reservations"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>

                            <Form.Item
                                name="reservationExpiryDays"
                                label="Reservation Expiry (days)"
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <InputNumber
                                    min={1}
                                    max={30}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="maxActiveReservations"
                                label="Max Reservations Per Member"
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <InputNumber
                                    min={1}
                                    max={10}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Card>

                        <Card
                            title={
                                <Space>
                                    <SettingOutlined />
                                    <span>General Settings</span>
                                </Space>
                            }
                            style={{ borderRadius: 12 }}
                        >
                            <Form.Item
                                name="allowSelfCheckout"
                                label="Allow Self Checkout"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>

                            <Form.Item
                                name="requireApprovalForRenewal"
                                label="Require Admin Approval for Renewals"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>

                <Divider />

                <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                    <Space>
                        <Button onClick={() => form.resetFields()}>
                            Reset
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            loading={saving}
                        >
                            Save Settings
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
}
