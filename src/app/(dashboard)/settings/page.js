'use client';

import { useState } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Row,
  Col,
  Typography,
  Divider,
  message,
  Space,
  Upload,
  TimePicker,
  InputNumber,
} from 'antd';
import {
  SettingOutlined,
  BankOutlined,
  BookOutlined,
  DollarOutlined,
  BellOutlined,
  SafetyOutlined,
  UploadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSave = async (values) => {
    setLoading(true);
    try {
      console.log('Settings:', values);
      setTimeout(() => {
        message.success('Settings saved successfully!');
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('Failed to save settings');
      setLoading(false);
    }
  };

  const GeneralSettings = () => (
    <Form layout="vertical" onFinish={handleSave} form={form}>
      <Title level={5}>School Information</Title>
      
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item name="schoolName" label="School Name" rules={[{ required: true }]}>
            <Input placeholder="Enter school name" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="tagline" label="Tagline">
            <Input placeholder="School tagline/motto" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
            <Input placeholder="school@example.com" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="phone" label="Phone">
            <Input placeholder="Phone number" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="website" label="Website">
            <Input placeholder="www.school.com" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="address" label="Address">
        <TextArea rows={2} placeholder="Full address" />
      </Form.Item>

      <Divider />

      <Title level={5}>Branding</Title>
      
      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Form.Item name="logo" label="School Logo">
            <Upload maxCount={1} listType="picture-card">
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="primaryColor" label="Primary Color">
            <Input type="color" style={{ width: 100, height: 40 }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="secondaryColor" label="Secondary Color">
            <Input type="color" style={{ width: 100, height: 40 }} />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      <Title level={5}>Operational Settings</Title>
      
      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Form.Item name="startTime" label="School Start Time">
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="endTime" label="School End Time">
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="periodDuration" label="Period Duration (minutes)">
            <InputNumber min={30} max={60} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="workingDays" label="Working Days">
        <Select mode="multiple" placeholder="Select working days">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
            <Option key={day} value={day}>{day}</Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
          Save Settings
        </Button>
      </Form.Item>
    </Form>
  );

  const AcademicSettings = () => (
    <Form layout="vertical" onFinish={handleSave}>
      <Title level={5}>Academic Year</Title>
      
      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Form.Item name="currentAcademicYear" label="Current Academic Year" rules={[{ required: true }]}>
            <Select>
              <Option value="2024-2025">2024-2025</Option>
              <Option value="2025-2026">2025-2026</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="yearStartMonth" label="Year Start Month">
            <Select>
              {['January', 'April', 'July', 'September'].map((m) => (
                <Option key={m} value={m}>{m}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      <Title level={5}>Grading System</Title>
      
      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Form.Item name="gradingType" label="Grading Type">
            <Select>
              <Option value="percentage">Percentage Based</Option>
              <Option value="gpa">GPA Based</Option>
              <Option value="both">Both</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="passingPercentage" label="Passing Percentage">
            <InputNumber min={0} max={100} suffix="%" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Text type="secondary">
        Grade Scale: A+ (90-100), A (80-89), B+ (70-79), B (60-69), C (50-59), F (Below 50)
      </Text>

      <Divider />

      <Title level={5}>Attendance Rules</Title>
      
      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Form.Item name="minAttendance" label="Minimum Attendance (%)">
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="lateArrivalMinutes" label="Late Arrival Threshold (minutes)">
            <InputNumber min={5} max={60} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="autoNotifyAbsent" valuePropName="checked" label="">
        <Space>
          <Switch />
          <span>Auto-notify parents on student absence</span>
        </Space>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
          Save Settings
        </Button>
      </Form.Item>
    </Form>
  );

  const FeeSettings = () => (
    <Form layout="vertical" onFinish={handleSave}>
      <Title level={5}>Fee Collection Rules</Title>
      
      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Form.Item name="dueDayOfMonth" label="Fee Due Day">
            <InputNumber min={1} max={28} placeholder="10" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="gracePeriod" label="Grace Period (days)">
            <InputNumber min={0} max={30} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="currency" label="Currency">
            <Select>
              <Option value="PKR">PKR - Pakistani Rupee</Option>
              <Option value="USD">USD - US Dollar</Option>
              <Option value="INR">INR - Indian Rupee</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      <Title level={5}>Late Fee Settings</Title>
      
      <Form.Item name="enableLateFee" valuePropName="checked">
        <Space>
          <Switch />
          <span>Enable Late Fee</span>
        </Space>
      </Form.Item>

      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Form.Item name="lateFeeType" label="Late Fee Type">
            <Select>
              <Option value="fixed">Fixed Amount</Option>
              <Option value="percentage">Percentage of Due</Option>
              <Option value="per-day">Per Day</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="lateFeeAmount" label="Late Fee Amount/Rate">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="maxLateFee" label="Maximum Late Fee">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      <Title level={5}>Payment Methods</Title>
      
      <Form.Item name="paymentMethods" label="Enabled Payment Methods">
        <Select mode="multiple">
          <Option value="cash">Cash</Option>
          <Option value="cheque">Cheque</Option>
          <Option value="bank-transfer">Bank Transfer</Option>
          <Option value="card">Card Payment</Option>
          <Option value="upi">UPI</Option>
          <Option value="online">Online Gateway</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
          Save Settings
        </Button>
      </Form.Item>
    </Form>
  );

  const NotificationSettings = () => (
    <Form layout="vertical" onFinish={handleSave}>
      <Title level={5}>Email Notifications</Title>
      
      <Form.Item name="enableEmail" valuePropName="checked">
        <Space>
          <Switch defaultChecked />
          <span>Enable Email Notifications</span>
        </Space>
      </Form.Item>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item name="smtpHost" label="SMTP Host">
            <Input placeholder="smtp.example.com" />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="smtpPort" label="SMTP Port">
            <InputNumber placeholder="587" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="smtpSecure" label="Secure">
            <Select>
              <Option value="tls">TLS</Option>
              <Option value="ssl">SSL</Option>
              <Option value="none">None</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item name="smtpUser" label="SMTP Username">
            <Input placeholder="username" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="smtpPassword" label="SMTP Password">
            <Input.Password placeholder="password" />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      <Title level={5}>SMS Notifications</Title>
      
      <Form.Item name="enableSms" valuePropName="checked">
        <Space>
          <Switch />
          <span>Enable SMS Notifications</span>
        </Space>
      </Form.Item>

      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Form.Item name="smsProvider" label="SMS Provider">
            <Select>
              <Option value="twilio">Twilio</Option>
              <Option value="msg91">MSG91</Option>
              <Option value="textlocal">TextLocal</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="smsApiKey" label="API Key">
            <Input.Password placeholder="API Key" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="smsSenderId" label="Sender ID">
            <Input placeholder="SCHOOL" />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      <Title level={5}>Notification Events</Title>
      
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Fee Payment Reminder</span>
          <Space>
            <Switch size="small" /> Email
            <Switch size="small" /> SMS
          </Space>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Attendance Alert</span>
          <Space>
            <Switch size="small" /> Email
            <Switch size="small" defaultChecked /> SMS
          </Space>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Exam Results Published</span>
          <Space>
            <Switch size="small" defaultChecked /> Email
            <Switch size="small" /> SMS
          </Space>
        </div>
      </Space>

      <Form.Item style={{ marginTop: 24 }}>
        <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
          Save Settings
        </Button>
      </Form.Item>
    </Form>
  );

  const tabItems = [
    {
      key: 'general',
      label: <><SettingOutlined /> General</>,
      children: <GeneralSettings />,
    },
    {
      key: 'academic',
      label: <><BookOutlined /> Academic</>,
      children: <AcademicSettings />,
    },
    {
      key: 'fees',
      label: <><DollarOutlined /> Fee Rules</>,
      children: <FeeSettings />,
    },
    {
      key: 'notifications',
      label: <><BellOutlined /> Notifications</>,
      children: <NotificationSettings />,
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Settings"
        subtitle="Configure system settings and preferences"
        breadcrumbs={[{ title: 'Settings' }]}
      />

      <Card style={{ borderRadius: 12 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          tabPosition="left"
          style={{ minHeight: 500 }}
        />
      </Card>
    </div>
  );
}

