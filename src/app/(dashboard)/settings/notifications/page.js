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
    Switch,
    message,
    Divider,
    Typography,
    Spin,
    Tabs
} from 'antd';
import {
    SaveOutlined,
    MailOutlined,
    MessageOutlined,
    WhatsAppOutlined,
    BellOutlined
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { settingsApi } from '@/lib/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

export default function NotificationSettingsPage() {
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
                if (settings.notificationSettings) {
                    form.setFieldsValue(settings.notificationSettings);
                }
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to fetch notification settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        setSaving(true);
        try {
            await settingsApi.updateNotifications(values);
            message.success('Notification settings updated successfully!');
            fetchSettings();
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
                title="Notification Settings"
                subtitle="Configure alerts, email, SMS, and push notification channels"
                breadcrumbs={[
                    { title: 'Settings', path: '/settings' },
                    { title: 'Notifications' },
                ]}
                backButton
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Card style={{ borderRadius: 12 }}>
                    <Tabs defaultActiveKey="channels">
                        <TabPane tab="Channels" key="channels">
                            <Row gutter={[24, 24]}>
                                <Col xs={24} md={12} lg={6}>
                                    <Card hoverable className="text-center">
                                        <MailOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 16 }} />
                                        <Title level={5}>Email</Title>
                                        <Form.Item name="emailEnabled" valuePropName="checked" noStyle>
                                            <Switch checkedChildren="On" unCheckedChildren="Off" />
                                        </Form.Item>
                                    </Card>
                                </Col>
                                <Col xs={24} md={12} lg={6}>
                                    <Card hoverable className="text-center">
                                        <MessageOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 16 }} />
                                        <Title level={5}>SMS</Title>
                                        <Form.Item name="smsEnabled" valuePropName="checked" noStyle>
                                            <Switch checkedChildren="On" unCheckedChildren="Off" />
                                        </Form.Item>
                                    </Card>
                                </Col>
                                <Col xs={24} md={12} lg={6}>
                                    <Card hoverable className="text-center">
                                        <WhatsAppOutlined style={{ fontSize: 24, color: '#25D366', marginBottom: 16 }} />
                                        <Title level={5}>WhatsApp</Title>
                                        <Form.Item name="whatsappEnabled" valuePropName="checked" noStyle>
                                            <Switch checkedChildren="On" unCheckedChildren="Off" />
                                        </Form.Item>
                                    </Card>
                                </Col>
                                <Col xs={24} md={12} lg={6}>
                                    <Card hoverable className="text-center">
                                        <BellOutlined style={{ fontSize: 24, color: '#faad14', marginBottom: 16 }} />
                                        <Title level={5}>Push</Title>
                                        <Form.Item name="pushEnabled" valuePropName="checked" noStyle>
                                            <Switch checkedChildren="On" unCheckedChildren="Off" />
                                        </Form.Item>
                                    </Card>
                                </Col>
                            </Row>
                        </TabPane>

                        <TabPane tab="Email Configuration" key="email">
                            <Row gutter={24}>
                                <Col xs={24} md={12}>
                                    <Form.Item name={['email', 'provider']} label="Provider">
                                        <Select>
                                            <Option value="smtp">SMTP</Option>
                                            <Option value="sendgrid">SendGrid</Option>
                                            <Option value="mailgun">Mailgun</Option>
                                            <Option value="ses">Amazon SES</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item name={['email', 'fromEmail']} label="From Email" rules={[{ type: 'email' }]}>
                                        <Input placeholder="noreply@school.com" />
                                    </Form.Item>
                                    <Form.Item name={['email', 'fromName']} label="From Name">
                                        <Input placeholder="School Admin" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name={['email', 'host']} label="SMTP Host">
                                        <Input placeholder="smtp.gmail.com" />
                                    </Form.Item>
                                    <Form.Item name={['email', 'port']} label="SMTP Port">
                                        <Input placeholder="587" />
                                    </Form.Item>
                                    <Form.Item name={['email', 'username']} label="Username">
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name={['email', 'replyTo']} label="Reply To" rules={[{ type: 'email' }]}>
                                        <Input placeholder="support@school.com" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </TabPane>

                        <TabPane tab="SMS Configuration" key="sms">
                            <Row gutter={24}>
                                <Col xs={24} md={12}>
                                    <Form.Item name={['sms', 'provider']} label="Provider">
                                        <Input placeholder="Twilio / Msg91" />
                                    </Form.Item>
                                    <Form.Item name={['sms', 'senderId']} label="Sender ID">
                                        <Input placeholder="SCHOOL" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name={['sms', 'apiKey']} label="API Key">
                                        <Input.Password placeholder="API Key" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </TabPane>
                    </Tabs>
                </Card>

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
                            Save Notification Settings
                        </Button>
                    </Space>
                </Card>
            </Form>
        </div>
    );
}
