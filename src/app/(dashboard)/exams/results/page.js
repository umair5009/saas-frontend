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
  InputNumber,
  message,
  Modal,
  Divider,
  Typography,
  Tag,
  Progress,
  Statistic,
} from 'antd';
import {
  TrophyOutlined,
  BookOutlined,
  TeamOutlined,
  SearchOutlined,
  DownloadOutlined,
  PrinterOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { examApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export default function ExamResultsPage() {
  const router = useRouter();
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [selectedExam, setSelectedExam] = useState(null);
  const [examDetails, setExamDetails] = useState(null);

  useEffect(() => {
    fetchExamResults();
  }, [filters]);

  const fetchExamResults = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        status: 'published,completed,marks-entry', // Only fetch exams with results
      };

      const data = await examApi.getAll(params);
      if (data.success) {
        // Process exams to match expected format
        const processedResults = (data.data || []).map(exam => ({
          ...exam,
          totalStudents: exam.statistics?.totalStudents || exam.studentMarks?.length || 0,
          appeared: exam.statistics?.appeared || 0,
          passed: exam.statistics?.passed || 0,
          failed: exam.statistics?.failed || 0,
          highestMarks: exam.statistics?.highestMarks || 0,
          averageMarks: exam.statistics?.averageMarks || 0,
        }));
        setExamResults(processedResults);
      }
    } catch (error) {
      console.error('Error fetching exam results:', error);
      message.error(error.response?.data?.message || 'Failed to fetch exam results');
    } finally {
      setLoading(false);
    }
  };

  const fetchExamDetails = async (examId) => {
    try {
      const data = await examApi.getById(examId);
      if (data.success) {
        setExamDetails(data.data);
      }
    } catch (error) {
      message.error('Failed to fetch exam details');
    }
  };

  const handleExamSelect = (examId) => {
    setSelectedExam(examId);
    fetchExamDetails(examId);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const columns = [
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject, record) => (
        <Space>
          <Text strong>{subject}</Text>
          <Tag color="blue">{record.examType}</Tag>
        </Space>
      ),
    },
    {
      title: 'Class',
      key: 'class',
      render: (_, record) => `${record.class} - ${record.section}`,
    },
    {
      title: 'Exam Date',
      dataIndex: 'examDate',
      key: 'examDate',
      render: (date) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Total Students',
      dataIndex: 'totalStudents',
      key: 'totalStudents',
    },
    {
      title: 'Appeared',
      dataIndex: 'appeared',
      key: 'appeared',
    },
    {
      title: 'Passed',
      dataIndex: 'passed',
      key: 'passed',
      render: (passed, record) => (
        <Space>
          <Text strong style={{ color: '#52c41a' }}>{passed}</Text>
          <Text type="secondary">
            ({((passed / record.appeared) * 100).toFixed(1)}%)
          </Text>
        </Space>
      ),
    },
    {
      title: 'Highest Score',
      dataIndex: 'highestMarks',
      key: 'highestMarks',
      render: (marks, record) => `${marks}/${record.totalMarks}`,
    },
    {
      title: 'Average Score',
      dataIndex: 'averageMarks',
      key: 'averageMarks',
      render: (marks, record) => marks?.toFixed(1) || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          completed: 'success',
          published: 'success',
          ongoing: 'processing',
          scheduled: 'default',
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
            onClick={() => router.push(`/exams/${record._id}`)}
          >
            View Details
          </Button>
          <Button
            type="link"
            onClick={() => router.push(`/exams/${record._id}/marks`)}
          >
            Enter Marks
          </Button>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadResult(record._id)}
          >
            Download
          </Button>
        </Space>
      ),
    },
  ];

  const handleDownloadResult = async (examId) => {
    try {
      // await examApi.downloadResult(examId);
      message.success('Result download started');
    } catch (error) {
      message.error('Failed to download result');
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Exam Results"
        subtitle="View and manage examination results"
        breadcrumbs={[
          { title: 'Exams', path: '/exams' },
          { title: 'Results' },
        ]}
        backButton
        actions={
          <Space>
            <Button icon={<DownloadOutlined />}>Export All</Button>
            <Button icon={<BarChartOutlined />}>Analytics</Button>
          </Space>
        }
      />

      {/* Filters */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={6}>
            <Select
              placeholder="Select Class"
              allowClear
              style={{ width: '100%' }}
              onChange={(v) => handleFilterChange('class', v)}
            >
              {Array(12).fill(null).map((_, i) => (
                <Option key={`Class ${i + 1}`} value={`Class ${i + 1}`}>Class {i + 1}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Select Subject"
              allowClear
              style={{ width: '100%' }}
              onChange={(v) => handleFilterChange('subject', v)}
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
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Exam Type"
              allowClear
              style={{ width: '100%' }}
              onChange={(v) => handleFilterChange('examType', v)}
            >
              <Option value="mid_term">Mid Term</Option>
              <Option value="final_term">Final Term</Option>
              <Option value="unit_test">Unit Test</Option>
              <Option value="monthly_test">Monthly Test</Option>
              <Option value="annual">Annual</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Academic Year"
              allowClear
              style={{ width: '100%' }}
              onChange={(v) => handleFilterChange('academicYear', v)}
            >
              <Option value="2024-2025">2024-2025</Option>
              <Option value="2025-2026">2025-2026</Option>
              <Option value="2026-2027">2026-2027</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Stats Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Exams"
              value={examResults.length}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Completed"
              value={examResults.filter(e => e.status === 'completed').length}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Average Pass Rate"
              value={
                examResults.length > 0
                  ? (examResults.reduce((sum, e) => sum + ((e.passed / e.appeared) * 100), 0) / examResults.length).toFixed(1)
                  : 0
              }
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Students"
              value={examResults.reduce((sum, e) => sum + (e.totalStudents || 0), 0)}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Exam Results Table */}
      <Card style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={examResults}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Selected Exam Details Modal */}
      <Modal
        title={examDetails ? `${examDetails.subject} - ${examDetails.class} ${examDetails.section}` : 'Exam Details'}
        open={!!selectedExam}
        onCancel={() => {
          setSelectedExam(null);
          setExamDetails(null);
        }}
        footer={null}
        width={800}
      >
        {examDetails && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Statistic title="Total Students" value={examDetails.studentMarks?.length || 0} />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Pass Percentage"
                  value={examDetails.statistics?.passPercentage || 0}
                  suffix="%"
                />
              </Col>
            </Row>

            <Divider />
            <Title level={4}>Grade Distribution</Title>
            {examDetails.statistics?.gradeDistribution && (
              <Row gutter={16}>
                {Object.entries(examDetails.statistics.gradeDistribution).map(([grade, count]) => (
                  <Col span={4} key={grade}>
                    <Card size="small">
                      <Statistic title={grade} value={count} />
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            <Divider />
            <Space>
              <Button icon={<PrinterOutlined />}>Print Results</Button>
              <Button icon={<DownloadOutlined />}>Download Excel</Button>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
}