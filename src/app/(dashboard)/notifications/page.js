'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Typography,
  Tabs,
  List,
  Avatar,
  Badge,
  Input,
  Select,
  Form,
  Radio,
  Checkbox,
  message,
  Modal,
  Empty,
  Divider,
} from 'antd';
import {
  BellOutlined,
  SendOutlined,
  MailOutlined,
  MessageOutlined,
  MobileOutlined,
  NotificationOutlined,
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { notificationApi } from '@/lib/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const notificationTypes = {
  fee_reminder: { icon: <ExclamationCircleOutlined />, color: '#faad14', label: 'Fee Reminder' },
  attendance: { icon: <ClockCircleOutlined />, color: '#1890ff', label: 'Attendance' },
  exam: { icon: <NotificationOutlined />, color: '#722ed1', label: 'Exam' },
  announcement: { icon: <BellOutlined />, color: '#52c41a', label: 'Announcement' },
  event: { icon: <TeamOutlined />, color: '#13c2c2', label: 'Event' },
  alert: { icon: <ExclamationCircleOutlined />, color: '#ff4d4f', label: 'Alert' },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('inbox');
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendModal, setSendModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [sendForm] = Form.useForm();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockNotifications = [
        {
          _id: '1',
          type: 'fee_reminder',
          title: 'Fee Payment Reminder',
          message: 'Monthly fee for January 2025 is due. Please make the payment before 10th.',
          recipients: { type: 'all_students', count: 1250 },
          sentVia: ['email', 'sms'],
          status: 'sent',
          sentAt: dayjs().subtract(2, 'hours').toISOString(),
          readCount: 856,
          sentBy: { name: 'Admin' },
        },
        {
          _id: '2',
          type: 'exam',
          title: 'Mid Term Exam Schedule',
          message: 'Mid term examinations will start from February 1st, 2025. Please check the schedule.',
          recipients: { type: 'class', class: 'Class 10', count: 180 },
          sentVia: ['email', 'push'],
          status: 'sent',
          sentAt: dayjs().subtract(1, 'day').toISOString(),
          readCount: 145,
          sentBy: { name: 'Principal' },
        },
        {
          _id: '3',
          type: 'announcement',
          title: 'Winter Vacation Notice',
          message: 'School will remain closed from December 25th to January 1st for winter vacation.',
          recipients: { type: 'all', count: 1500 },
          sentVia: ['email', 'sms', 'push'],
          status: 'sent',
          sentAt: dayjs().subtract(5, 'days').toISOString(),
          readCount: 1320,
          sentBy: { name: 'Admin' },
        },
        {
          _id: '4',
          type: 'attendance',
          title: 'Low Attendance Alert',
          message: 'Your ward has attendance below 75%. Please ensure regular attendance.',
          recipients: { type: 'selected_parents', count: 45 },
          sentVia: ['sms'],
          status: 'sent',
          sentAt: dayjs().subtract(3, 'hours').toISOString(),
          readCount: 38,
          sentBy: { name: 'Class Teacher' },
        },
      ];

      const mockTemplates = [
        { _id: '1', name: 'Fee Reminder', type: 'fee_reminder', message: 'Fee of Rs. {amount} is due on {date}.' },
        { _id: '2', name: 'Attendance Alert', type: 'attendance', message: 'Your ward {student_name} was absent today.' },
        { _id: '3', name: 'Exam Schedule', type: 'exam', message: 'Exam for {subject} is scheduled on {date}.' },
        { _id: '4', name: 'General Announcement', type: 'announcement', message: '{message}' },
      ];

      setNotifications(mockNotifications);
      setTemplates(mockTemplates);
    } catch (error) {
      message.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (values) => {
    try {
      // await notificationApi.send(values);
      message.success('Notification sent successfully!');
      setSendModal(false);
      sendForm.resetFields();
      fetchNotifications();
    } catch (error) {
      message.error('Failed to send notification');
    }
  };

  const NotificationList = ({ data }) => (
    <List
      loading={loading}
      dataSource={data}
      renderItem={(item) => {
        const typeConfig = notificationTypes[item.type] || notificationTypes.announcement;
        return (
          <List.Item
            actions={[
              <Button key="view" type="link" onClick={() => setSelectedNotification(item)}>
                View
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar style={{ background: `${typeConfig.color}15` }}>
                  {React.cloneElement(typeConfig.icon, { style: { color: typeConfig.color } })}
                </Avatar>
              }
              title={
                <Space>
                  <Text strong>{item.title}</Text>
                  <Tag color={typeConfig.color}>{typeConfig.label}</Tag>
                  {item.sentVia?.map((via) => (
                    <Tag key={via} style={{ fontSize: 11 }}>
                      {via === 'email' ? <MailOutlined /> : via === 'sms' ? <MobileOutlined /> : <BellOutlined />}
                      {' '}{via.toUpperCase()}
                    </Tag>
                  ))}
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 4 }}>
                    {item.message}
                  </Paragraph>
                  <Space split="•" style={{ fontSize: 12, color: '#8c8c8c' }}>
                    <span>To: {item.recipients?.type} ({item.recipients?.count})</span>
                    <span>Read: {item.readCount}/{item.recipients?.count}</span>
                    <span>{dayjs(item.sentAt).fromNow()}</span>
                    <span>by {item.sentBy?.name}</span>
                  </Space>
                </Space>
              }
            />
          </List.Item>
        );
      }}
      locale={{ emptyText: <Empty description="No notifications" /> }}
    />
  );

  const SendNotificationForm = () => (
    <Form form={sendForm} layout="vertical" onFinish={handleSendNotification}>
      <Form.Item
        name="type"
        label="Notification Type"
        rules={[{ required: true }]}
      >
        <Select placeholder="Select type">
          {Object.entries(notificationTypes).map(([key, config]) => (
            <Option key={key} value={key}>
              <Space>
                {config.icon}
                {config.label}
              </Space>
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true }]}
      >
        <Input placeholder="Notification title" />
      </Form.Item>

      <Form.Item
        name="message"
        label="Message"
        rules={[{ required: true }]}
      >
        <TextArea rows={4} placeholder="Notification message..." />
      </Form.Item>

      <Form.Item
        name="recipientType"
        label="Recipients"
        rules={[{ required: true }]}
      >
        <Radio.Group>
          <Radio value="all_students">All Students</Radio>
          <Radio value="all_staff">All Staff</Radio>
          <Radio value="all">Everyone</Radio>
          <Radio value="class">Specific Class</Radio>
          <Radio value="selected">Selected Users</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.recipientType !== curr.recipientType}
      >
        {({ getFieldValue }) => {
          if (getFieldValue('recipientType') === 'class') {
            return (
              <Form.Item name="class" label="Select Class" rules={[{ required: true }]}>
                <Select placeholder="Select class">
                  {Array(12).fill(null).map((_, i) => (
                    <Option key={i} value={`Class ${i + 1}`}>Class {i + 1}</Option>
                  ))}
                </Select>
              </Form.Item>
            );
          }
          return null;
        }}
      </Form.Item>

      <Form.Item
        name="channels"
        label="Send Via"
        rules={[{ required: true }]}
      >
        <Checkbox.Group>
          <Checkbox value="email"><MailOutlined /> Email</Checkbox>
          <Checkbox value="sms"><MobileOutlined /> SMS</Checkbox>
          <Checkbox value="push"><BellOutlined /> Push Notification</Checkbox>
        </Checkbox.Group>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
            Send Notification
          </Button>
          <Button onClick={() => setSendModal(false)}>Cancel</Button>
        </Space>
      </Form.Item>
    </Form>
  );

  const tabItems = [
    {
      key: 'inbox',
      label: <><BellOutlined /> All Notifications</>,
      children: (
        <Card style={{ borderRadius: 12 }}>
          <NotificationList data={notifications} />
        </Card>
      ),
    },
    {
      key: 'templates',
      label: <><NotificationOutlined /> Templates</>,
      children: (
        <Card
          style={{ borderRadius: 12 }}
          extra={
            <Button type="primary" icon={<PlusOutlined />}>
              Create Template
            </Button>
          }
        >
          <List
            dataSource={templates}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button key="edit" type="link">Edit</Button>,
                  <Button key="use" type="link">Use</Button>,
                ]}
              >
                <List.Item.Meta
                  title={item.name}
                  description={
                    <Space direction="vertical" size={0}>
                      <Tag color={notificationTypes[item.type]?.color}>
                        {notificationTypes[item.type]?.label}
                      </Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.message}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Notifications"
        subtitle="Send and manage notifications to students, staff, and parents"
        breadcrumbs={[{ title: 'Notifications' }]}
        actions={
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => setSendModal(true)}
          >
            Send Notification
          </Button>
        }
      />

      {/* Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <BellOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 600 }}>{notifications.length}</div>
              <Text type="secondary">Total Sent</Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <MailOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 600 }}>
                {notifications.reduce((sum, n) => sum + (n.sentVia?.includes('email') ? 1 : 0), 0)}
              </div>
              <Text type="secondary">Emails</Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <MobileOutlined style={{ fontSize: 32, color: '#faad14', marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 600 }}>
                {notifications.reduce((sum, n) => sum + (n.sentVia?.includes('sms') ? 1 : 0), 0)}
              </div>
              <Text type="secondary">SMS</Text>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 600 }}>
                {Math.round(notifications.reduce((sum, n) => sum + (n.readCount / n.recipients.count) * 100, 0) / notifications.length) || 0}%
              </div>
              <Text type="secondary">Avg Read Rate</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      {/* Send Modal */}
      <Modal
        title="Send Notification"
        open={sendModal}
        onCancel={() => setSendModal(false)}
        footer={null}
        width={600}
      >
        <SendNotificationForm />
      </Modal>

      {/* View Notification Modal */}
      <Modal
        title={selectedNotification?.title}
        open={!!selectedNotification}
        onCancel={() => setSelectedNotification(null)}
        footer={null}
      >
        {selectedNotification && (
          <div>
            <Tag color={notificationTypes[selectedNotification.type]?.color}>
              {notificationTypes[selectedNotification.type]?.label}
            </Tag>
            <Divider />
            <Paragraph>{selectedNotification.message}</Paragraph>
            <Divider />
            <Space direction="vertical" size="small">
              <Text type="secondary">Recipients: {selectedNotification.recipients?.type} ({selectedNotification.recipients?.count})</Text>
              <Text type="secondary">Read by: {selectedNotification.readCount}</Text>
              <Text type="secondary">Sent via: {selectedNotification.sentVia?.join(', ')}</Text>
              <Text type="secondary">Sent by: {selectedNotification.sentBy?.name}</Text>
              <Text type="secondary">Sent at: {dayjs(selectedNotification.sentAt).format('DD MMM YYYY, hh:mm A')}</Text>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
}

