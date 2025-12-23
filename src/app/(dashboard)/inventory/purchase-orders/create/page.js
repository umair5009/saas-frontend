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
  InputNumber,
  DatePicker,
  message,
  Divider,
  Typography,
  Table,
  Modal,
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { inventoryApi } from '@/lib/api';

const { Title, Text } = Typography;
const { Option } = Select;

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [items, setItems] = useState([{ name: '', quantity: 1, unitPrice: 0, description: '' }]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const orderData = {
        ...values,
        orderDate: values.orderDate?.format('YYYY-MM-DD'),
        expectedDeliveryDate: values.expectedDeliveryDate?.format('YYYY-MM-DD'),
        items: items.filter(item => item.name && item.quantity > 0),
      };

      await inventoryApi.createPurchaseOrder(orderData);
      message.success('Purchase order created successfully!');
      router.push('/inventory');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, unitPrice: 0, description: '' }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const columns = [
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => updateItem(index, 'name', e.target.value)}
          placeholder="Item name"
        />
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record, index) => (
        <InputNumber
          value={text}
          onChange={(value) => updateItem(index, 'quantity', value)}
          min={1}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (text, record, index) => (
        <InputNumber
          value={text}
          onChange={(value) => updateItem(index, 'unitPrice', value)}
          formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
          min={0}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, record) => `Rs. ${(record.quantity * record.unitPrice).toLocaleString()}`,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => updateItem(index, 'description', e.target.value)}
          placeholder="Description"
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record, index) => (
        items.length > 1 && (
          <Button
            type="link"
            danger
            onClick={() => removeItem(index)}
          >
            Remove
          </Button>
        )
      ),
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Create Purchase Order"
        subtitle="Create a new purchase order for inventory items"
        breadcrumbs={[
          { title: 'Inventory', path: '/inventory' },
          { title: 'Purchase Orders', path: '/inventory' },
          { title: 'Create' },
        ]}
        backButton
      />

      <Card style={{ borderRadius: 12 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'draft',
            priority: 'normal',
          }}
        >
          {/* Order Information */}
          <Divider>Order Information</Divider>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                name="orderNumber"
                label="Order Number"
                rules={[{ required: true, message: 'Please enter order number' }]}
              >
                <Input placeholder="Auto-generated or manual" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="orderDate"
                label="Order Date"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="expectedDeliveryDate"
                label="Expected Delivery Date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                name="supplier"
                label="Supplier"
                rules={[{ required: true, message: 'Please select supplier' }]}
              >
                <Select placeholder="Select supplier">
                  <Option value="supplier-1">ABC Suppliers</Option>
                  <Option value="supplier-2">XYZ Traders</Option>
                  <Option value="supplier-3">Global Electronics</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="draft">Draft</Option>
                  <Option value="pending">Pending Approval</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="ordered">Ordered</Option>
                  <Option value="received">Received</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="low">Low</Option>
                  <Option value="normal">Normal</Option>
                  <Option value="high">High</Option>
                  <Option value="urgent">Urgent</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item name="currency" label="Currency">
                <Select defaultValue="PKR">
                  <Option value="PKR">PKR</Option>
                  <Option value="USD">USD</Option>
                  <Option value="EUR">EUR</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Contact Information */}
          <Divider>Contact Information</Divider>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item name="contactPerson" label="Contact Person">
                <Input placeholder="Supplier contact person" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="contactEmail" label="Contact Email">
                <Input placeholder="contact@supplier.com" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="contactPhone" label="Contact Phone">
                <Input placeholder="Phone number" />
              </Form.Item>
            </Col>
          </Row>

          {/* Order Items */}
          <Divider>Order Items</Divider>

          <Table
            columns={columns}
            dataSource={items}
            pagination={false}
            rowKey={(record, index) => index}
            style={{ marginBottom: 16 }}
          />

          <Button
            type="dashed"
            onClick={addItem}
            icon={<PlusOutlined />}
            style={{ width: '100%', marginBottom: 24 }}
          >
            Add Another Item
          </Button>

          {/* Order Summary */}
          <Card style={{ background: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: 24 }}>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Statistic
                  title="Total Items"
                  value={items.filter(item => item.name && item.quantity > 0).length}
                  prefix={<ShoppingCartOutlined />}
                />
              </Col>
              <Col xs={24} md={12}>
                <Statistic
                  title="Total Amount"
                  value={calculateTotal()}
                  prefix="Rs."
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>

          {/* Additional Information */}
          <Divider>Additional Information</Divider>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item name="shippingAddress" label="Shipping Address">
                <Input.TextArea rows={3} placeholder="Delivery address" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="notes" label="Notes/Comments">
                <Input.TextArea rows={3} placeholder="Additional notes or special instructions" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="terms" label="Terms & Conditions">
            <Input.TextArea rows={4} placeholder="Payment terms, delivery conditions, etc." />
          </Form.Item>

          <Divider />

          <Space style={{ width: '100%', justifyContent: 'end' }}>
            <Button onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
            >
              Create Purchase Order
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}