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
  DatePicker,
  Switch,
  message,
  Divider,
  Typography,
  Table,
  Spin,
} from 'antd';
import {
  DollarOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components.common.PageHeader';
import { settingsApi } from '@/lib.api';

const { Title, Text } = Typography;
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
      const { data } = await settingsApi.getFeeSettings();
      if (data.success) {
        setSettings(data.data);
        form.setFieldsValue(data.data);
      }
    } catch (error) {
      message.error('Failed to fetch fee settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      await settingsApi.updateFeeSettings(values);
      message.success('Fee settings updated successfully!');
      fetchSettings();
    } catch (error) {
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
        subtitle="Configure fee collection rules, discounts, and late fees"
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
          discountTypes: [],
          scholarshipTypes: [],
          paymentMethods: ['cash', 'cheque', 'bank-transfer', 'online'],
          autoGenerateInvoices: true,
          sendPaymentReminders: true,
          reminderDays: 7,
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

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          {/* Discount Types */}
          <Col xs={24} lg={12}>
            <Card title="Discount Types" style={{ borderRadius: 12 }}>
              <Form.List name="discountTypes">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <div key={key}>
                        {index > 0 && <Divider style={{ margin: '12px 0' }} />}
                        <Row gutter={16} align="middle">
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, 'name']}
                              label={index === 0 ? 'Discount Name' : ''}
                              rules={[{ required: true }]}
                            >
                              <Input placeholder="e.g., Sibling Discount" />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'type']}
                              label={index === 0 ? 'Type' : ''}
                              rules={[{ required: true }]}
                            >
                              <Select placeholder="Type">
                                <Option value="percentage">Percentage</Option>
                                <Option value="fixed">Fixed Amount</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'value']}
                              label={index === 0 ? 'Value' : ''}
                              rules={[{ required: true }]}
                            >
                              <InputNumber
                                min={0}
                                max={100}
                                style={{ width: '100%' }}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            {fields.length > 1 && (
                              <Button
                                type="link"
                                danger
                                onClick={() => remove(name)}
                                style={{ marginTop: index === 0 ? 30 : 0 }}
                              >
                                <DeleteOutlined />
                              </Button>
                            )}
                          </Col>
                        </Row>
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                      style={{ width: '100%', marginTop: 16 }}
                    >
                      Add Discount Type
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </Col>

          {/* Scholarship Types */}
          <Col xs={24} lg={12}>
            <Card title="Scholarship Types" style={{ borderRadius: 12 }}>
              <Form.List name="scholarshipTypes">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <div key={key}>
                        {index > 0 && <Divider style={{ margin: '12px 0' }} />}
                        <Row gutter={16} align="middle">
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, 'name']}
                              label={index === 0 ? 'Scholarship Name' : ''}
                              rules={[{ required: true }]}
                            >
                              <Input placeholder="e.g., Merit Scholarship" />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'type']}
                              label={index === 0 ? 'Type' : ''}
                              rules={[{ required: true }]}
                            >
                              <Select placeholder="Type">
                                <Option value="percentage">Percentage</Option>
                                <Option value="fixed">Fixed Amount</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'value']}
                              label={index === 0 ? 'Value' : ''}
                              rules={[{ required: true }]}
                            >
                              <InputNumber
                                min={0}
                                max={100}
                                style={{ width: '100%' }}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            {fields.length > 1 && (
                              <Button
                                type="link"
                                danger
                                onClick={() => remove(name)}
                                style={{ marginTop: index === 0 ? 30 : 0 }}
                              >
                                <DeleteOutlined />
                              </Button>
                            )}
                          </Col>
                        </Row>
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                      style={{ width: '100%', marginTop: 16 }}
                    >
                      Add Scholarship Type
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          {/* Fee Collection Rules */}
          <Col xs={24}>
            <Card title="Fee Collection Rules" style={{ borderRadius: 12 }}>
              <Row gutter={24}>
                <Col xs={24} md={6}>
                  <Form.Item
                    name="feeCollectionStartDay"
                    label="Collection Start Day"
                  >
                    <InputNumber
                      min={1}
                      max={31}
                      placeholder="1"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    name="feeDueDay"
                    label="Due Day of Month"
                  >
                    <InputNumber
                      min={1}
                      max={31}
                      placeholder="10"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    name="feeReminderFrequency"
                    label="Reminder Frequency (Days)"
                  >
                    <InputNumber
                      min={1}
                      max={30}
                      placeholder="7"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    name="maxOverdueDays"
                    label="Maximum Overdue Days"
                  >
                    <InputNumber
                      min={30}
                      max={365}
                      placeholder="90"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Row gutter={24}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="allowPartialPayments"
                    label="Allow Partial Payments"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="autoApplyDiscounts"
                    label="Auto-apply Eligible Discounts"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="requireApprovalForDiscounts"
                    label="Require Approval for Discounts >"
                  >
                    <InputNumber
                      min={0}
                      placeholder="1000"
                      style={{ width: '100%' }}
                      formatter={(value) => `Rs. ${value}`}
                      parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
              </Row>
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
}</contents>
</xai:function_call ><xai:function_call name="write">
<parameter name="file_path">frontend/src/app/(dashboard)/settings/notifications/page.js
