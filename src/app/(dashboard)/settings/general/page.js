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
  SettingOutlined,
  SaveOutlined,
  UploadOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
// import { settingsApi } from '@/lib/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function GeneralSettingsPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    // try {
    //   const data  = await settingsApi.getGeneral();
    //   if (data.success) {
    //     setSettings(data.data);
    //     form.setFieldsValue(data.data);
    //   }
    // } catch (error) {
    //   message.error('Failed to fetch general settings');
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    // try {
    //   await settingsApi.updateGeneral(values);
    //   message.success('General settings updated successfully!');
    //   fetchSettings();
    // } catch (error) {
    //   message.error(error.response?.data?.message || 'Failed to update settings');
    // } finally {
    //   setSaving(false);
    // }
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
        backButton
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
          maintenanceMode: false,
          registrationEnabled: true,
          emailNotifications: true,
          smsNotifications: false,
          ...settings,
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

              <Form.Item name="description" label="Description">
                <TextArea rows={3} placeholder="Brief description of the system" />
              </Form.Item>

              <Divider>Logo & Branding</Divider>

              <Form.Item label="System Logo">
                <Upload listType="picture-card" maxCount={1}>
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
                  <Option value="ar">Arabic</Option>
                </Select>
              </Form.Item>

              <Form.Item name="theme" label="Default Theme">
                <Select placeholder="Select theme">
                  <Option value="light">Light</Option>
                  <Option value="dark">Dark</Option>
                  <Option value="auto">Auto (System)</Option>
                </Select>
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          {/* Contact Information */}
          <Col xs={24} lg={12}>
            <Card title="Contact Information" style={{ borderRadius: 12 }}>
              <Form.Item name="supportEmail" label="Support Email">
                <Input placeholder="support@school.com" />
              </Form.Item>

              <Form.Item name="supportPhone" label="Support Phone">
                <Input placeholder="+92-XXX-XXXXXXX" />
              </Form.Item>

              <Form.Item name="website" label="Website URL">
                <Input placeholder="https://school.com" />
              </Form.Item>

              <Form.Item name="address" label="Address">
                <TextArea rows={3} placeholder="Complete address" />
              </Form.Item>
            </Card>
          </Col>

          {/* System Features */}
          <Col xs={24} lg={12}>
            <Card title="System Features" style={{ borderRadius: 12 }}>
              <Form.Item
                name="maintenanceMode"
                label="Maintenance Mode"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Text type="secondary" style={{ fontSize: 12, marginBottom: 16 }}>
                Enable maintenance mode to temporarily disable the system for updates
              </Text>

              <Form.Item
                name="registrationEnabled"
                label="User Registration"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Text type="secondary" style={{ fontSize: 12, marginBottom: 16 }}>
                Allow new users to register accounts
              </Text>

              <Divider>Notifications</Divider>

              <Form.Item
                name="emailNotifications"
                label="Email Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="smsNotifications"
                label="SMS Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="pushNotifications"
                label="Push Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          {/* Data Management */}
          <Col xs={24} lg={12}>
            <Card title="Data Management" style={{ borderRadius: 12 }}>
              <Form.Item
                name="dataRetentionDays"
                label="Data Retention (Days)"
              >
                <InputNumber
                  min={30}
                  max={3650}
                  placeholder="365"
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Text type="secondary" style={{ fontSize: 12, marginBottom: 16 }}>
                Number of days to keep system logs and temporary data
              </Text>

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

              <Form.Item
                name="maxFileSize"
                label="Maximum File Size (MB)"
              >
                <InputNumber
                  min={1}
                  max={100}
                  placeholder="10"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Security Settings */}
          <Col xs={24} lg={12}>
            <Card title="Security Settings" style={{ borderRadius: 12 }}>
              <Form.Item
                name="passwordMinLength"
                label="Minimum Password Length"
              >
                <InputNumber
                  min={6}
                  max={32}
                  placeholder="8"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="sessionTimeout"
                label="Session Timeout (minutes)"
              >
                <InputNumber
                  min={15}
                  max={480}
                  placeholder="60"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="maxLoginAttempts"
                label="Max Login Attempts"
              >
                <InputNumber
                  min={3}
                  max={10}
                  placeholder="5"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="twoFactorAuth"
                label="Two-Factor Authentication"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="ipWhitelist"
                label="IP Whitelist Enabled"
                valuePropName="checked"
              >
                <Switch />
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