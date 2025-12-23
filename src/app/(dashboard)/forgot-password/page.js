'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, Typography, Space, message, Result } from 'antd';
import { MailOutlined, LockOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { authApi } from '@/lib/api';

const { Title, Text, Link } = Typography;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(values);
      setEmailSent(true);
      setUserEmail(values.email);
      message.success('Password reset email sent successfully!');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: 24,
        }}
      >
        <Card
          style={{
            width: '100%',
            maxWidth: 420,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            borderRadius: 16,
          }}
          bodyStyle={{ padding: 40 }}
        >
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: 72 }} />}
            title="Check Your Email!"
            subTitle={
              <Space direction="vertical" size="small">
                <Text>
                  We've sent a password reset link to <strong>{userEmail}</strong>
                </Text>
                <Text type="secondary">
                  Click the link in the email to reset your password. The link will expire in 1 hour.
                </Text>
              </Space>
            }
            extra={[
              <Button
                key="back"
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/login')}
              >
                Back to Login
              </Button>,
              <Button
                key="resend"
                onClick={() => {
                  setEmailSent(false);
                  form.resetFields();
                }}
              >
                Try Different Email
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 24,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          borderRadius: 16,
        }}
        bodyStyle={{ padding: 40 }}
      >
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
            }}
          >
            <LockOutlined style={{ fontSize: 32, color: '#fff' }} />
          </div>
          <Title level={2} style={{ marginBottom: 8 }}>
            Forgot Password?
          </Title>
          <Text type="secondary">
            Enter your email address and we'll send you a link to reset your password.
          </Text>
        </div>

        {/* Reset Form */}
        <Form
          form={form}
          name="forgot-password"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Email address"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 48,
                borderRadius: 8,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
              }}
            >
              Send Reset Link
            </Button>
          </Form.Item>
        </Form>

        {/* Back to Login */}
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Remember your password?{' '}
            <Link onClick={() => router.push('/login')} style={{ fontWeight: 500 }}>
              Back to Login
            </Link>
          </Text>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            © 2025 School SaaS. All rights reserved.
          </Text>
        </div>
      </Card>
    </div>
  );
}