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
  Typography,
  Spin,
} from 'antd';
import {
  SaveOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { settingsApi } from '@/lib/api';

const { Option } = Select;

export default function FeeSettingsPage() {
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
    try {
      const response = await settingsApi.getSettings();
      if (response.data.success) {
        const settingsData = response.data.data;
        if (settingsData.feeRules) {
          const fees = settingsData.feeRules;

          // Text transformation for paymentMethods (Object[] -> String[])
          // Filter only isEnabled ones or just map method if simple list
          let paymentMethods = [];
          if (Array.isArray(fees.paymentMethods)) {
            paymentMethods = fees.paymentMethods
              .filter(pm => pm.isEnabled)
              .map(pm => pm.method);
          }

          const formattedSettings = {
            ...fees,
            paymentMethods
          };

          setSettings(formattedSettings);
          form.setFieldsValue(formattedSettings);
        }
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch fee settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      // Transformation for paymentMethods (String[] -> Object[])
      const formattedValues = { ...values };

      if (values.paymentMethods && Array.isArray(values.paymentMethods)) {
        formattedValues.paymentMethods = values.paymentMethods.map(method => ({
          method,
          isEnabled: true,
          processingFee: 0, // Default
          processingFeeType: 'fixed' // Default
        }));
      }

      await settingsApi.updateFeeRules(formattedValues);
      message.success('Fee settings updated successfully!');
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
        title="Fee Settings"
        subtitle="Configure fee rules and late fees"
        breadcrumbs={[
          { title: 'Settings', path: '/settings' },
          { title: 'Fees' },
        ]}
        backButton
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          lateFeePerDay: 10,
          lateFeeGracePeriod: 7,
          maxInstallments: 6,
          paymentMethods: ['cash', 'cheque', 'bank-transfer', 'online'],
          ...settings,
        }}
      >
        <Row gutter={[24, 24]}>
          {/* Late Fee Settings */}
          <Col xs={24} lg={12}>
            <Card title="Late Fee Configuration" style={{ borderRadius: 12 }}>
              <Form.Item
                name="lateFeePerDay"
                label="Late Fee Per Day (Rs.)"
                rules={[{ required: true, message: 'Please enter late fee amount' }]}
              >
                <InputNumber
                  min={0}
                  max={500}
                  style={{ width: '100%' }}
                  formatter={(value) => `Rs. ${value}`}
                  parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                />
              </Form.Item>

              <Form.Item
                name="lateFeeGracePeriod"
                label="Grace Period (Days)"
                rules={[{ required: true, message: 'Please enter grace period' }]}
              >
                <InputNumber
                  min={0}
                  max={30}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="maxInstallments"
                label="Maximum Installments"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={1}
                  max={12}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="lateFeeCap"
                label="Late Fee Cap (Rs.)"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(value) => `Rs. ${value}`}
                  parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Payment Settings */}
          <Col xs={24} lg={12}>
            <Card title="Payment Configuration" style={{ borderRadius: 12 }}>
              <Form.Item
                name="paymentMethods"
                label="Accepted Payment Methods"
                rules={[{ required: true }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select payment methods"
                  style={{ width: '100%' }}
                >
                  <Option value="cash">Cash</Option>
                  <Option value="cheque">Cheque</Option>
                  <Option value="bank-transfer">Bank Transfer</Option>
                  <Option value="online">Online Payment</Option>
                  <Option value="card">Credit/Debit Card</Option>
                  <Option value="upi">UPI</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="autoGenerateInvoices"
                label="Auto-generate Invoices"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="sendPaymentReminders"
                label="Send Payment Reminders"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="reminderDays"
                label="Reminder Days Before Due Date"
              >
                <InputNumber
                  min={1}
                  max={30}
                  style={{ width: '100%' }}
                />
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
              Save Fee Settings
            </Button>
          </Space>
        </Card>
      </Form>
    </div>
  );
}