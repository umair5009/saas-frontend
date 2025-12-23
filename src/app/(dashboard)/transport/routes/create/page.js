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
  TimePicker,
  message,
  Divider,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  SaveOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components.common.PageHeader';
import { transportApi } from '@/lib.api';

const { Title, Text } = Typography;
const { Option } = Select;

export default function CreateTransportRoutePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [stops, setStops] = useState([{ stopName: '', arrivalTime: null, pickupFee: 0 }]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const routeData = {
        ...values,
        stops: stops.map(stop => ({
          ...stop,
          arrivalTime: stop.arrivalTime?.format('HH:mm'),
        })),
      };

      await transportApi.createRoute(routeData);
      message.success('Transport route created successfully!');
      router.push('/transport');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create route');
    } finally {
      setLoading(false);
    }
  };

  const addStop = () => {
    setStops([...stops, { stopName: '', arrivalTime: null, pickupFee: 0 }]);
  };

  const removeStop = (index) => {
    const newStops = stops.filter((_, i) => i !== index);
    setStops(newStops);
  };

  const updateStop = (index, field, value) => {
    const newStops = [...stops];
    newStops[index][field] = value;
    setStops(newStops);
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Create Transport Route"
        subtitle="Define a new transport route with stops and timings"
        breadcrumbs={[
          { title: 'Transport', path: '/transport' },
          { title: 'Routes', path: '/transport' },
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
            type: 'pickup',
            status: 'active',
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="routeName"
                label="Route Name"
                rules={[{ required: true, message: 'Please enter route name' }]}
              >
                <Input placeholder="e.g., DHA Main Route" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="type"
                label="Route Type"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select type">
                  <Option value="pickup">Pickup Route</Option>
                  <Option value="drop">Drop Route</Option>
                  <Option value="both">Pickup & Drop</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select status">
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="maintenance">Under Maintenance</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                name="startTime"
                label="Start Time"
                rules={[{ required: true, message: 'Please select start time' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="endTime"
                label="End Time"
                rules={[{ required: true, message: 'Please select end time' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="vehicle" label="Assigned Vehicle">
                <Select placeholder="Select vehicle (optional)">
                  {/* This would be populated from vehicles API */}
                  <Option value="vehicle-1">Bus ABC-123</Option>
                  <Option value="vehicle-2">Van XYZ-456</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Route Stops</Divider>

          <div style={{ marginBottom: 24 }}>
            <Text type="secondary">
              Define the stops along this route. Students can be assigned to specific stops.
            </Text>
          </div>

          {stops.map((stop, index) => (
            <Card
              key={index}
              size="small"
              style={{ marginBottom: 16 }}
              extra={
                stops.length > 1 && (
                  <Button
                    type="link"
                    danger
                    onClick={() => removeStop(index)}
                    size="small"
                  >
                    Remove
                  </Button>
                )
              }
            >
              <Row gutter={16} align="middle">
                <Col span={1}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: '#1890ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 'bold',
                    }}
                  >
                    {index + 1}
                  </div>
                </Col>
                <Col span={7}>
                  <Input
                    placeholder="Stop name"
                    value={stop.stopName}
                    onChange={(e) => updateStop(index, 'stopName', e.target.value)}
                  />
                </Col>
                <Col span={5}>
                  <TimePicker
                    placeholder="Arrival time"
                    format="HH:mm"
                    value={stop.arrivalTime}
                    onChange={(time) => updateStop(index, 'arrivalTime', time)}
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col span={5}>
                  <InputNumber
                    placeholder="Pickup fee"
                    prefix="Rs."
                    value={stop.pickupFee}
                    onChange={(value) => updateStop(index, 'pickupFee', value)}
                    style={{ width: '100%' }}
                    min={0}
                  />
                </Col>
                <Col span={6}>
                  <Input
                    placeholder="Location coordinates (optional)"
                    value={stop.location}
                    onChange={(e) => updateStop(index, 'location', e.target.value)}
                  />
                </Col>
              </Row>
            </Card>
          ))}

          <Button
            type="dashed"
            onClick={addStop}
            icon={<PlusOutlined />}
            style={{ width: '100%', marginBottom: 24 }}
          >
            Add Another Stop
          </Button>

          <Divider>Additional Information</Divider>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} placeholder="Route description and notes" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="capacity" label="Maximum Capacity">
                <InputNumber
                  placeholder="Maximum number of students"
                  style={{ width: '100%' }}
                  min={1}
                />
              </Form.Item>
            </Col>
          </Row>

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
              Create Route
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}