'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Select,
  message,
  Table,
  Typography,
} from 'antd';
import { TeamOutlined, SaveOutlined } from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { studentApi, academicApi } from '@/lib/api';

const { Option } = Select;
const { Text } = Typography;

export default function PromoteStudentsPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [eligible, setEligible] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [promoting, setPromoting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [currentSections, setCurrentSections] = useState([]);
  const [targetSections, setTargetSections] = useState([]);

  useEffect(() => {
    fetchClasses();
    fetchAcademicYears();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await academicApi.getClasses();
      if (data.success) {
        setClasses(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const data = await academicApi.getAcademicYears();
      if (data.success) {
        setAcademicYears(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch academic years:', error);
    }
  };

  // Fetch eligible students
  const fetchStudents = async (values) => {
    setLoading(true);
    try {
      const res = await studentApi.getAll({
        class: values.currentClass,
        section: values.currentSection,
        status: 'active',
      });
      if (res.success) {
        setEligible(res.data || []);
      }
    } catch (err) {
      message.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentClassChange = (classId) => {
    const selectedClass = classes.find(c => c._id === classId);
    if (selectedClass) {
      setCurrentSections(selectedClass.sections || []);
    } else {
      setCurrentSections([]);
    }
    form.setFieldValue('currentSection', undefined);
  };

  const handleTargetClassChange = (classId) => {
    const selectedClass = classes.find(c => c._id === classId);
    if (selectedClass) {
      setTargetSections(selectedClass.sections || []);
    } else {
      setTargetSections([]);
    }
    form.setFieldValue('promoteToSection', undefined);
  };

  const handleFinish = async (values) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Select at least one student');
      return;
    }
    setPromoting(true);
    try {
      await studentApi.promote({
        studentIds: selectedRowKeys,
        newClass: values.promoteToClass,
        newSection: values.promoteToSection,
        newAcademicYear: values.promoteToAcademicYear,
      });
      message.success('Students promoted!');
      router.push('/students');
    } catch (error) {
      message.error('Promotion failed!');
    } finally {
      setPromoting(false);
    }
  };

  const columns = [
    {
      title: 'Admission #',
      dataIndex: 'admissionNumber',
      key: 'admissionNumber'
    },
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => `${record.firstName} ${record.lastName}`
    },
    {
      title: 'Class',
      dataIndex: 'class',
    },
    {
      title: 'Section',
      dataIndex: 'section',
    },
    {
      title: 'Roll No.',
      dataIndex: 'rollNumber'
    }
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Promote Students"
        subtitle="Bulk promote eligible students to new class and section"
        breadcrumbs={[{ title: 'Students', path: '/students' }, { title: 'Promote' }]}
        backButton
      />
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Form form={form} layout="inline" onFinish={fetchStudents}>
          <Form.Item
            name="currentClass"
            rules={[{ required: true }]}>
            <Select
              placeholder="Current Class"
              style={{ width: 150 }}
              onChange={handleCurrentClassChange}
            >
              {classes.map((cls) => (<Option key={cls._id} value={cls._id}>{cls.name}</Option>))}
            </Select>
          </Form.Item>
          <Form.Item
            name="currentSection"
            rules={[{ required: true }]}>
            <Select
              placeholder="Section"
              style={{ width: 120 }}
              disabled={currentSections.length === 0}
            >
              {currentSections.map((sec) => (
                <Option key={sec.name} value={sec.name}>Section {sec.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary">Fetch Students</Button>
          </Form.Item>
        </Form>
      </Card>
      {eligible.length > 0 && (
        <>
          <Card style={{ marginBottom: 24, borderRadius: 12 }}>
            <Table
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
                type: 'checkbox',
              }}
              columns={columns}
              dataSource={eligible}
              loading={loading}
              rowKey="_id"
              pagination={false}
            />
          </Card>
          <Card>
            <Form form={form} layout="inline" onFinish={handleFinish}>
              <Form.Item
                name="promoteToClass"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Promote to Class"
                  style={{ width: 150 }}
                  onChange={handleTargetClassChange}
                >
                  {classes.map((cls) => (<Option key={cls._id} value={cls._id}>{cls.name}</Option>))}
                </Select>
              </Form.Item>
              <Form.Item
                name="promoteToSection"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Section"
                  style={{ width: 120 }}
                  disabled={targetSections.length === 0}
                >
                  {targetSections.map((sec) => (
                    <Option key={sec.name} value={sec.name}>Section {sec.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="promoteToAcademicYear"
                rules={[{ required: true }]}
              >
                <Select placeholder="Academic Year" style={{ width: 170 }}>
                  {academicYears.map((year) => (
                    <Option key={year._id} value={year.name}>{year.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={promoting}
                >
                  Promote Selected
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </>
      )}
    </div>
  );
}
