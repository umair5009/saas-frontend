'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, Typography, Checkbox, message, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, BankOutlined } from '@ant-design/icons';
import useAuthStore from '@/store/authStore';

const { Title, Text, Link } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const result = await login(values);

    if (result.success) {
      message.success('Login successful!');
      router.push('/dashboard');
    } else {
      message.error(result.message || 'Login failed');
    }
  };

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
            <BankOutlined style={{ fontSize: 32, color: '#fff' }} />
          </div>
          <Title level={2} style={{ marginBottom: 8 }}>
            Welcome Back
          </Title>
          <Text type="secondary">Sign in to your school management account</Text>
        </div>

        {/* Login Form */}
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
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
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Email address"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <Link href="/forgot-password">Forgot password?</Link>
            </div>
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              style={{
                height: 48,
                borderRadius: 8,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
              }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        {/* Demo Credentials */}
        <Divider plain style={{ margin: '24px 0' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Demo Credentials</Text>
        </Divider>

        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 13
          }}>
            <div><strong>Super Admin:</strong> admin@school.com / password123</div>
          </div>
          <div style={{
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 13
          }}>
            <div><strong>Branch Admin:</strong> branch@school.com / password123</div>
          </div>
        </Space>

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

