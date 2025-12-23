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
  Upload,
  Radio,
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  UploadOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { inventoryApi } from '@/lib/api';

const { Title, Text } = Typography;
const { Option } = Select;

export default function CreateAssetPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [assetType, setAssetType] = useState('fixed-asset');

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const assetData = {
        ...values,
        purchaseDate: values.purchaseDate?.format('YYYY-MM-DD'),
        warrantyEndDate: values.warrantyEndDate?.format('YYYY-MM-DD'),
        lastMaintenanceDate: values.lastMaintenanceDate?.format('YYYY-MM-DD'),
        nextMaintenanceDate: values.nextMaintenanceDate?.format('YYYY-MM-DD'),
      };

      await inventoryApi.createAsset(assetData);
      message.success('Asset created successfully!');
      router.push('/inventory');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  const calculateDepreciation = () => {
    const values = form.getFieldsValue();
    if (values.originalValue && values.salvageValue && values.usefulLife) {
      const annualDep = (values.originalValue - values.salvageValue) / values.usefulLife;
      const currentValue = values.originalValue - (annualDep * (new Date().getFullYear() - new Date(values.purchaseDate).getFullYear()));
      form.setFieldsValue({
        currentValue: Math.max(currentValue, values.salvageValue),
        accumulatedDepreciation: values.originalValue - Math.max(currentValue, values.salvageValue),
      });
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Add New Asset"
        subtitle="Register a new asset in the inventory system"
        breadcrumbs={[
          { title: 'Inventory', path: '/inventory' },
          { title: 'Assets', path: '/inventory' },
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
            type: 'fixed-asset',
            status: 'available',
            condition: 'new',
          }}
        >
          {/* Basic Information */}
          <Divider>Basic Information</Divider>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Asset Name"
                rules={[{ required: true, message: 'Please enter asset name' }]}
              >
                <Input placeholder="e.g., Dell Laptop, Classroom Projector" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="assetTag"
                label="Asset Tag"
                rules={[{ required: true, message: 'Please enter asset tag' }]}
              >
                <Input placeholder="Unique asset identifier" />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item
                name="type"
                label="Asset Type"
                rules={[{ required: true }]}
              >
                <Select onChange={setAssetType}>
                  <Option value="fixed-asset">Fixed Asset</Option>
                  <Option value="consumable">Consumable</Option>
                  <Option value="equipment">Equipment</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select category">
                  <Option value="electronics">Electronics</Option>
                  <Option value="furniture">Furniture</Option>
                  <Option value="books">Books</Option>
                  <Option value="sports">Sports Equipment</Option>
                  <Option value="laboratory">Laboratory</Option>
                  <Option value="maintenance">Maintenance</Option>
                  <Option value="stationery">Stationery</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="serialNumber" label="Serial Number">
                <Input placeholder="Manufacturer serial number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="model" label="Model">
                <Input placeholder="Model number or name" />
              </Form.Item>
            </Col>
          </Row>

          {/* Quantity for Consumables */}
          {assetType === 'consumable' && (
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="quantity"
                  label="Quantity"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    placeholder="Current quantity"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="minimumStock"
                  label="Minimum Stock Level"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="Reorder when below this level"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="unit"
                  label="Unit"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select unit">
                    <Option value="pieces">Pieces</Option>
                    <Option value="kg">Kilograms</Option>
                    <Option value="liters">Liters</Option>
                    <Option value="boxes">Boxes</Option>
                    <Option value="packs">Packs</Option>
                    <Option value="sets">Sets</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* Purchase Information */}
          <Divider>Purchase Information</Divider>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                name="purchaseDate"
                label="Purchase Date"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="purchasePrice"
                label="Purchase Price"
                rules={[{ required: true }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="invoiceNumber" label="Invoice Number">
                <Input placeholder="Purchase invoice number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item name="vendor" label="Vendor/Supplier">
                <Input placeholder="Supplier name and contact" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="supplierContact" label="Supplier Contact">
                <Input placeholder="Phone/email of supplier" />
              </Form.Item>
            </Col>
          </Row>

          {/* Financial Information (for fixed assets) */}
          {assetType === 'fixed-asset' && (
            <>
              <Divider>Financial Information</Divider>

              <Row gutter={24}>
                <Col xs={24} md={6}>
                  <Form.Item
                    name="originalValue"
                    label="Original Value"
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    name="salvageValue"
                    label="Salvage Value"
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    name="usefulLife"
                    label="Useful Life (Years)"
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={1}
                      max={50}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="depreciationMethod" label="Depreciation Method">
                    <Select>
                      <Option value="straight-line">Straight Line</Option>
                      <Option value="declining-balance">Declining Balance</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={8}>
                  <Form.Item name="currentValue" label="Current Value">
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                      min={0}
                      readOnly
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="accumulatedDepreciation" label="Accumulated Depreciation">
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                      min={0}
                      readOnly
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Button
                    type="default"
                    icon={<CalculatorOutlined />}
                    onClick={calculateDepreciation}
                    style={{ marginTop: 30 }}
                  >
                    Calculate Depreciation
                  </Button>
                </Col>
              </Row>
            </>
          )}

          {/* Condition and Assignment */}
          <Divider>Condition & Assignment</Divider>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                name="condition"
                label="Condition"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="new">New</Option>
                  <Option value="excellent">Excellent</Option>
                  <Option value="good">Good</Option>
                  <Option value="fair">Fair</Option>
                  <Option value="poor">Poor</Option>
                  <Option value="damaged">Damaged</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="available">Available</Option>
                  <Option value="in-use">In Use</Option>
                  <Option value="under-maintenance">Under Maintenance</Option>
                  <Option value="disposed">Disposed</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="location" label="Current Location">
                <Input placeholder="Room number or location" />
              </Form.Item>
            </Col>
          </Row>

          {/* Warranty Information */}
          <Divider>Warranty & Maintenance</Divider>

          <Row gutter={24}>
            <Col xs={24} md={6}>
              <Form.Item name="hasWarranty" label="Has Warranty">
                <Radio.Group>
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="warrantyEndDate" label="Warranty End Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="provider" label="Warranty Provider">
                <Input placeholder="Warranty provider name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="nextMaintenanceDate" label="Next Maintenance Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {/* Documents */}
          <Divider>Documents</Divider>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item label="Purchase Invoice">
                <Upload listType="picture-card" maxCount={1}>
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload Invoice</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Warranty Documents">
                <Upload listType="picture-card" maxCount={3}>
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload Documents</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          {/* Description */}
          <Form.Item name="description" label="Description/Notes">
            <Input.TextArea rows={4} placeholder="Additional notes about the asset" />
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
              Create Asset
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}
