'use client';

import { useState } from 'react';
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
  Radio,
  Checkbox,
  message,
  Divider,
  Typography,
  Spin,
  Result,
} from 'antd';
import {
  SendOutlined,
  SaveOutlined,
  MailOutlined,
  MessageOutlined,
  BellOutlined,
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { notificationApi } from '@/lib/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function SendNotificationPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [notificationData, setNotificationData] = useState(null);

  const handleSubmit = async (values) => {
    setSending(true);
    try {
      const { data } = await notificationApi.send({
        ...values,
        channels: values.channels || [],
      });

      if (data.success) {
        setSent(true);
        setNotificationData({
          id: data.data._id,
          recipients: data.data.recipients?.count || 0,
          channels: data.data.sentVia || [],
          title: values.title,
        });
        message.success('Notification sent successfully!');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleNewNotification = () => {
    setSent(false);
    setNotificationData(null);
    form.resetFields();
  };

  if (sent && notificationData) {
    return (
      <div className="fade-in">
        <Card style={{ borderRadius: 12, textAlign: 'center' }}>
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: 72 }} />}
            title="Notification Sent Successfully!"
            subTitle={
              <Space direction="vertical" size="small">
                <Text strong>Title: {notificationData.title}</Text>
                <Text>Sent to: {notificationData.recipients} recipients</Text>
                <Text>Channels: {notificationData.channels.join(', ')}</Text>
                <Text type="secondary">ID: {notificationData.id}</Text>
              </Space>
            }
            extra={[
              <Button key="new" type="primary" onClick={handleNewNotification}>
                Send Another Notification
              </Button>,
              <Button key="history" onClick={() => router.push('/notifications')}>
                View History
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Send Notification"
        subtitle="Send notifications to students, staff, and parents"
        breadcrumbs={[
          { title: 'Notifications', path: '/notifications' },
          { title: 'Send' },
        ]}
        backButton
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: 12 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                type: 'announcement',
                recipientType: 'all_students',
                channels: ['email'],
              }}
            >
              {/* Notification Type */}
              <Form.Item
                name="type"
                label="Notification Type"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select notification type">
                  <Option value="announcement">
                    <Space>
                      <BellOutlined />
                      General Announcement
                    </Space>
                  </Option>
                  <Option value="fee_reminder">
                    <Space>
                      <CheckCircleOutlined />
                      Fee Reminder
                    </Space>
                  </Option>
                  <Option value="exam">
                    <Space>
                      <UserOutlined />
                      Exam Notification
                    </Space>
                  </Option>
                  <Option value="attendance">
                    <Space>
                      <TeamOutlined />
                      Attendance Alert
                    </Space>
                  </Option>
                  <Option value="event">
                    <Space>
                      <BellOutlined />
                      Event Notification
                    </Space>
                  </Option>
                  <Option value="alert">
                    <Space>
                      <ExclamationCircleOutlined />
                      System Alert
                    </Space>
                  </Option>
                </Select>
              </Form.Item>

              {/* Title */}
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: 'Please enter notification title' }]}
              >
                <Input placeholder="Notification title" />
              </Form.Item>

              {/* Message */}
              <Form.Item
                name="message"
                label="Message"
                rules={[{ required: true, message: 'Please enter notification message' }]}
              >
                <TextArea
                  rows={6}
                  placeholder="Enter the notification message..."
                  showCount
                  maxLength={1000}
                />
              </Form.Item>

              <Divider />

              {/* Recipients */}
              <Form.Item
                name="recipientType"
                label="Recipients"
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value="all_students">
                      <Space>
                        <UserOutlined />
                        All Students
                      </Space>
                    </Radio>
                    <Radio value="all_staff">
                      <Space>
                        <TeamOutlined />
                        All Staff
                      </Space>
                    </Radio>
                    <Radio value="all">
                      <Space>
                        <TeamOutlined />
                        Everyone (Students, Staff & Parents)
                      </Space>
                    </Radio>
                    <Radio value="class">Specific Class</Radio>
                    <Radio value="selected">Selected Users</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              {/* Conditional Fields */}
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.recipientType !== curr.recipientType}
              >
                {({ getFieldValue }) => {
                  const recipientType = getFieldValue('recipientType');

                  if (recipientType === 'class') {
                    return (
                      <Form.Item
                        name="class"
                        label="Select Class"
                        rules={[{ required: true }]}
                      >
                        <Select placeholder="Choose class">
                          {Array(12).fill(null).map((_, i) => (
                            <Option key={`Class ${i + 1}`} value={`Class ${i + 1}`}>
                              Class {i + 1}
                            </Option>
                          ))}
                          <Option value="Nursery">Nursery</Option>
                          <Option value="KG">KG</Option>
                        </Select>
                      </Form.Item>
                    );
                  }

                  if (recipientType === 'selected') {
                    return (
                      <Form.Item
                        name="selectedUsers"
                        label="Selected Users"
                        rules={[{ required: true }]}
                      >
                        <Select
                          mode="multiple"
                          placeholder="Search and select users"
                          allowClear
                          style={{ width: '100%' }}
                        >
                          {/* This would be populated from API */}
                          <Option value="user-1">Ali Khan (Student)</Option>
                          <Option value="user-2">Sarah Ahmed (Teacher)</Option>
                        </Select>
                      </Form.Item>
                    );
                  }

                  return null;
                }}
              </Form.Item>

              <Divider />

              {/* Channels */}
              <Form.Item
                name="channels"
                label="Send Via"
                rules={[{ required: true, message: 'Please select at least one channel' }]}
              >
                <Checkbox.Group>
                  <Space direction="vertical">
                    <Checkbox value="email">
                      <Space>
                        <MailOutlined />
                        Email
                      </Space>
                    </Checkbox>
                    <Checkbox value="sms">
                      <Space>
                        <MessageOutlined />
                        SMS
                      </Space>
                    </Checkbox>
                    <Checkbox value="push">
                      <Space>
                        <BellOutlined />
                        Push Notification
                      </Space>
                    </Checkbox>
                  </Space>
                </Checkbox.Group>
              </Form.Item>

              {/* Priority */}
              <Form.Item name="priority" label="Priority">
                <Select placeholder="Select priority">
                  <Option value="low">Low</Option>
                  <Option value="normal">Normal</Option>
                  <Option value="high">High</Option>
                  <Option value="urgent">Urgent</Option>
                </Select>
              </Form.Item>

              {/* Additional Options */}
              <Form.Item
                name="scheduleForLater"
                label="Schedule for Later"
                valuePropName="checked"
              >
                <Checkbox>Schedule this notification</Checkbox>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.scheduleForLater !== curr.scheduleForLater}
              >
                {({ getFieldValue }) => {
                  if (getFieldValue('scheduleForLater')) {
                    return (
                      <Form.Item
                        name="scheduledDate"
                        label="Scheduled Date & Time"
                        rules={[{ required: true }]}
                      >
                        <DatePicker showTime style={{ width: '100%' }} />
                      </Form.Item>
                    );
                  }
                  return null;
                }}
              </Form.Item>

              <Divider />

              <Space style={{ width: '100%', justifyContent: 'end' }}>
                <Button onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={sending}
                  icon={<SendOutlined />}
                  size="large"
                >
                  Send Notification
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Preview */}
          <Card title="Preview" style={{ borderRadius: 12 }}>
            <Form.Item
              noStyle
              shouldUpdate
            >
              {({ getFieldValue }) => {
                const title = getFieldValue('title');
                const message = getFieldValue('message');
                const type = getFieldValue('type');

                return (
                  <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                    <Title level={5} style={{ marginBottom: 8 }}>
                      {title || 'Notification Title'}
                    </Title>
                    <Text style={{ display: 'block', marginBottom: 8 }}>
                      {message || 'Notification message will appear here...'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Type: {type || 'announcement'}
                    </Text>
                  </div>
                );
              }}
            </Form.Item>
          </Card>

          {/* Quick Stats */}
          <Card title="Recent Activity" style={{ marginTop: 24, borderRadius: 12 }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text><MailOutlined /> 1,250 emails sent today</Text>
              <Text><MessageOutlined /> 850 SMS sent today</Text>
              <Text><BellOutlined /> 2,100 push notifications sent today</Text>
            </Space>
          </Card>

          {/* Tips */}
          <Card title="Tips" style={{ marginTop: 24, borderRadius: 12 }}>
            <Space direction="vertical" size="small">
              <Text>• Keep messages clear and concise</Text>
              <Text>• Use appropriate priority levels</Text>
              <Text>• Test notifications before sending to large groups</Text>
              <Text>• Check recipient preferences</Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}