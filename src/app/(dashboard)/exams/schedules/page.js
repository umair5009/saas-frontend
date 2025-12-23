'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Table,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Modal,
  Divider,
  Typography,
  Tag,
  Calendar,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  BookOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { examApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export default function ExamSchedulesPage() {
  const router = useRouter();
  const [examSchedules, setExamSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchExamSchedules();
  }, []);

  const fetchExamSchedules = async () => {
    setLoading(true);
    try {
      const data = await examApi.getSchedules();
      console.log('📋 Schedules Page API Response:', data);

      if (data.success) {
        setExamSchedules(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      message.error('Failed to fetch exam schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const scheduleData = {
        name: values.name,
        examType: values.examType,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        academicYear: values.academicYear,
        term: values.term,
        status: values.status || 'draft',
        description: values.description,
        // Format classes for backend - convert to array of objects if needed
        classes: values.classes?.map(cls => ({ class: cls })) || [],
      };

      if (editingSchedule) {
        await examApi.updateSchedule(editingSchedule._id, scheduleData);
        message.success('Exam schedule updated successfully');
      } else {
        await examApi.createSchedule(scheduleData);
        message.success('Exam schedule created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingSchedule(null);
      fetchExamSchedules();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to save exam schedule');
    }
  };

  const handleEdit = (record) => {
    setEditingSchedule(record);
    form.setFieldsValue({
      ...record,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await examApi.deleteSchedule(id);
      message.success('Exam schedule deleted successfully');
      fetchExamSchedules();
    } catch (error) {
      message.error('Failed to delete exam schedule');
    }
  };

  const columns = [
    {
      title: 'Schedule Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Text strong>{name}</Text>
          <Tag color="blue">{record.examType}</Tag>
        </Space>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(record.startDate).format('DD MMM')} - {dayjs(record.endDate).format('DD MMM YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(record.endDate).diff(dayjs(record.startDate), 'days')} days
          </Text>
        </Space>
      ),
    },
    {
      title: 'Classes',
      key: 'classes',
      render: (_, record) => {
        const classes = record.classes?.map(c => c.class || c) || [];
        return (
          <Space wrap>
            {classes.length > 0 ? (
              classes.slice(0, 3).map((cls, idx) => <Tag key={idx} color="green">{cls}</Tag>)
            ) : (
              <Text type="secondary">All Classes</Text>
            )}
            {classes.length > 3 && <Tag>+{classes.length - 3} more</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          draft: 'default',
          scheduled: 'blue',
          ongoing: 'processing',
          completed: 'success',
          published: 'success',
        };
        return <Tag color={colors[status] || 'default'}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            icon={<CalendarOutlined />}
            onClick={() => router.push(`/exams/schedules/${record._id}`)}
          >
            View Details
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Exam Schedules"
        subtitle="Create and manage examination schedules"
        breadcrumbs={[
          { title: 'Exams', path: '/exams' },
          { title: 'Schedules' },
        ]}
        backButton
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingSchedule(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Create Schedule
          </Button>
        }
      />

      {/* Exam Schedules Table */}
      <Card style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={examSchedules}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingSchedule ? 'Edit Exam Schedule' : 'Create Exam Schedule'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingSchedule(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            examType: 'mid_term',
            status: 'draft',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Schedule Name"
                rules={[{ required: true, message: 'Please enter schedule name' }]}
              >
                <Input placeholder="e.g., Mid Term Examination 2025" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="examType"
                label="Exam Type"
                rules={[{ required: true, message: 'Please select exam type' }]}
              >
                <Select placeholder="Select Exam Type">
                  <Option value="mid_term">Mid Term</Option>
                  <Option value="final_term">Final Term</Option>
                  <Option value="unit_test">Unit Test</Option>
                  <Option value="monthly_test">Monthly Test</Option>
                  <Option value="annual">Annual</Option>
                  <Option value="entrance">Entrance</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="dateRange"
            label="Exam Period"
            rules={[{ required: true, message: 'Please select date range' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="classes"
            label="Applicable Classes"
            rules={[{ required: true, message: 'Please select classes' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select classes (leave empty for all)"
              allowClear
            >
              {Array(12).fill(null).map((_, i) => (
                <Option key={`Class ${i + 1}`} value={`Class ${i + 1}`}>Class {i + 1}</Option>
              ))}
              <Option value="Nursery">Nursery</Option>
              <Option value="KG">KG</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="subjects"
            label="Subjects"
            rules={[{ required: true, message: 'Please select subjects' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select subjects for examination"
              allowClear
            >
              <Option value="Mathematics">Mathematics</Option>
              <Option value="English">English</Option>
              <Option value="Urdu">Urdu</Option>
              <Option value="Science">Science</Option>
              <Option value="Social Studies">Social Studies</Option>
              <Option value="Islamiyat">Islamiyat</Option>
              <Option value="Computer Science">Computer Science</Option>
              <Option value="Physics">Physics</Option>
              <Option value="Chemistry">Chemistry</Option>
              <Option value="Biology">Biology</Option>
              <Option value="Pak Studies">Pak Studies</Option>
              <Option value="Arts">Arts</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select>
                  <Option value="draft">Draft</Option>
                  <Option value="scheduled">Scheduled</Option>
                  <Option value="ongoing">Ongoing</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="published">Published</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="term" label="Term">
                <Select placeholder="Select Term">
                  <Option value="First Term">First Term</Option>
                  <Option value="Second Term">Second Term</Option>
                  <Option value="Third Term">Third Term</Option>
                  <Option value="Annual">Annual</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="academicYear" label="Academic Year">
            <Select placeholder="Select Academic Year">
              <Option value="2024-2025">2024-2025</Option>
              <Option value="2025-2026">2025-2026</Option>
              <Option value="2026-2027">2026-2027</Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Additional notes or instructions" />
          </Form.Item>

          <Divider />

          <Space style={{ width: '100%', justifyContent: 'end' }}>
            <Button onClick={() => {
              setModalVisible(false);
              setEditingSchedule(null);
              form.resetFields();
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingSchedule ? 'Update' : 'Create'} Schedule
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}