'use client';

import { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Form,
  Input,
  Button,
  Divider,
  Space,
  message,
  Tabs,
  Upload,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  CameraOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { useAuthStore } from '@/store';
import { authApi } from '@/lib/api';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      // await authApi.updateProfile(values);
      message.success('Profile updated successfully!');
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    setLoading(true);
    try {
      // await authApi.changePassword(values);
      message.success('Password changed successfully!');
      passwordForm.resetFields();
    } catch (error) {
      message.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const ProfileTab = () => (
    <Card style={{ borderRadius: 12 }}>
      <Form
        form={profileForm}
        layout="vertical"
        onFinish={handleUpdateProfile}
        initialValues={user}
      >
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Avatar
                size={120}
                style={{ background: '#1890ff', marginBottom: 16 }}
                icon={<UserOutlined />}
                src={user?.avatar}
              />
              <Upload showUploadList={false}>
                <Button icon={<CameraOutlined />}>Change Photo</Button>
              </Upload>
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input prefix={<MailOutlined />} disabled />
            </Form.Item>
            <Form.Item name="phone" label="Phone">
              <Input prefix={<PhoneOutlined />} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                Update Profile
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );

  const SecurityTab = () => (
    <Card title="Change Password" style={{ borderRadius: 12 }}>
      <Form
        form={passwordForm}
        layout="vertical"
        onFinish={handleChangePassword}
        style={{ maxWidth: 400 }}
      >
        <Form.Item
          name="currentPassword"
          label="Current Password"
          rules={[{ required: true, message: 'Please enter current password' }]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: 'Please enter new password' },
            { min: 8, message: 'Password must be at least 8 characters' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Please confirm password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  const tabItems = [
    { key: 'profile', label: 'Profile', children: <ProfileTab /> },
    { key: 'security', label: 'Security', children: <SecurityTab /> },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="My Profile"
        subtitle="Manage your account settings"
        breadcrumbs={[{ title: 'Profile' }]}
      />

      {/* Profile Summary */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={24} align="middle">
          <Col>
            <Avatar
              size={80}
              style={{ background: '#1890ff' }}
              icon={<UserOutlined />}
              src={user?.avatar}
            />
          </Col>
          <Col>
            <Title level={4} style={{ marginBottom: 4 }}>{user?.name || 'User'}</Title>
            <Text type="secondary">{user?.email}</Text>
            <br />
            <Text type="secondary" style={{ textTransform: 'capitalize' }}>
              {user?.role?.replace('_', ' ')}
            </Text>
          </Col>
        </Row>
      </Card>

      <Tabs items={tabItems} />
    </div>
  );
}

