'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    Row,
    Col,
    Button,
    Space,
    Form,
    Input,
    Select,
    InputNumber,
    Switch,
    message,
    Divider,
    Typography,
    Upload,
    Spin,
} from 'antd';
import {
    SaveOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { settingsApi } from '@/lib/api';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function GeneralSettingsPage() {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await settingsApi.getSettings();
            if (response.data.success) {
                const settings = response.data.data;

                // Map backend settings to form fields
                form.setFieldsValue({
                    // Branding
                    systemName: settings.branding?.appName,
                    tagline: settings.branding?.tagline,
                    primaryColor: settings.branding?.primaryColor,
                    address: settings.branding?.copyrightText, // Using copyright for footer text usually, but reusing field

                    // Localization
                    timezone: settings.localization?.timezone,
                    currency: settings.localization?.currency,
                    language: settings.localization?.defaultLanguage,
                    theme: settings.branding?.darkMode ? 'dark' : 'light',

                    // System/Security (Subset)
                    maintenanceMode: false, // Not in schema directly? Check backup/system settings
                    backupFrequency: settings.backupSettings?.backupFrequency,

                    // Custom/Other
                    supportEmail: settings.customFields?.supportEmail,
                    supportPhone: settings.customFields?.supportPhone,
                });
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to fetch general settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        setSaving(true);
        try {
            // Prepare Branding Update
            const brandingData = {
                appName: values.systemName,
                tagline: values.tagline,
                primaryColor: values.primaryColor,
                darkMode: values.theme === 'dark',
                copyrightText: values.address
            };

            // Prepare Localization Update
            const localizationData = {
                timezone: values.timezone,
                currency: values.currency,
                defaultLanguage: values.language
            };

            // Prepare Backup Update
            const backupData = {
                backupFrequency: values.backupFrequency
            };

            // Execute updates in parallel
            await Promise.all([
                settingsApi.updateBranding(brandingData),
                settingsApi.updateLocalization(localizationData),
                settingsApi.updateSection('backupSettings', backupData)
            ]);

            message.success('General settings updated successfully!');
            fetchSettings(); // Refresh
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || 'Failed to update settings');
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
                title="General Settings"
                subtitle="Configure general system settings and preferences"
                breadcrumbs={[
                    { title: 'Settings', path: '/settings' },
                    { title: 'General' },
                ]}
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    systemName: 'School SaaS',
                    timezone: 'Asia/Karachi',
                    currency: 'PKR',
                    language: 'en',
                    theme: 'light',
                }}
            >
                <Row gutter={[24, 24]}>
                    {/* Basic Information */}
                    <Col xs={24} lg={12}>
                        <Card title="Basic Information" style={{ borderRadius: 12 }}>
                            <Form.Item
                                name="systemName"
                                label="System Name"
                                rules={[{ required: true, message: 'Please enter system name' }]}
                            >
                                <Input placeholder="School Management System" />
                            </Form.Item>

                            <Form.Item name="tagline" label="Tagline">
                                <Input placeholder="Managing Education Excellence" />
                            </Form.Item>

                            <Divider>Logo & Branding</Divider>

                            <Form.Item label="System Logo">
                                <Upload listType="picture-card" maxCount={1} action="/api/upload" showUploadList={false}>
                                    <div>
                                        <UploadOutlined />
                                        <div style={{ marginTop: 8 }}>Upload Logo</div>
                                    </div>
                                </Upload>
                            </Form.Item>

                            <Form.Item name="primaryColor" label="Primary Color">
                                <Select placeholder="Select primary color">
                                    <Option value="#1890ff">Blue (Default)</Option>
                                    <Option value="#52c41a">Green</Option>
                                    <Option value="#faad14">Orange</Option>
                                    <Option value="#722ed1">Purple</Option>
                                    <Option value="#ff4d4f">Red</Option>
                                </Select>
                            </Form.Item>
                        </Card>
                    </Col>

                    {/* System Configuration */}
                    <Col xs={24} lg={12}>
                        <Card title="System Configuration" style={{ borderRadius: 12 }}>
                            <Form.Item
                                name="timezone"
                                label="Timezone"
                                rules={[{ required: true }]}
                            >
                                <Select placeholder="Select timezone">
                                    <Option value="Asia/Karachi">Asia/Karachi (PKT)</Option>
                                    <Option value="Asia/Dubai">Asia/Dubai (GST)</Option>
                                    <Option value="UTC">UTC</Option>
                                    <Option value="America/New_York">America/New_York (EST)</Option>
                                    <Option value="Europe/London">Europe/London (GMT)</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="currency"
                                label="Currency"
                                rules={[{ required: true }]}
                            >
                                <Select placeholder="Select currency">
                                    <Option value="PKR">Pakistani Rupee (PKR)</Option>
                                    <Option value="USD">US Dollar (USD)</Option>
                                    <Option value="EUR">Euro (EUR)</Option>
                                    <Option value="GBP">British Pound (GBP)</Option>
                                    <Option value="INR">Indian Rupee (INR)</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="language"
                                label="Default Language"
                                rules={[{ required: true }]}
                            >
                                <Select placeholder="Select language">
                                    <Option value="en">English</Option>
                                    <Option value="ur">Urdu</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="theme" label="Default Theme">
                                <Select placeholder="Select theme">
                                    <Option value="light">Light</Option>
                                    <Option value="dark">Dark</Option>
                                </Select>
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                    {/* Data Management (Backup) */}
                    <Col xs={24} lg={12}>
                        <Card title="Data Management" style={{ borderRadius: 12 }}>
                            <Form.Item
                                name="backupFrequency"
                                label="Automatic Backup"
                            >
                                <Select placeholder="Select backup frequency">
                                    <Option value="daily">Daily</Option>
                                    <Option value="weekly">Weekly</Option>
                                    <Option value="monthly">Monthly</Option>
                                    <Option value="disabled">Disabled</Option>
                                </Select>
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>

                {/* Save Button */}
                <Card style={{ marginTop: 24, borderRadius: 12 }}>
                    <Space style={{ width: '100%', justifyContent: 'end' }}>
                        <Button onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={saving}
                            icon={<SaveOutlined />}
                        >
                            Save Settings
                        </Button>
                    </Space>
                </Card>
            </Form>
        </div>
    );
}
