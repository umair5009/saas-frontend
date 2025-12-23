'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Row,
  Col,
  Typography,
  Descriptions,
  Tag,
  Space,
  Button,
  Table,
  Tabs,
  Divider,
  Spin,
  message,
  Progress,
  Statistic,
  Avatar,
  Input,
  Select,
} from 'antd';
import {
  BookOutlined,
  EditOutlined,
  TrophyOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { examApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export default function ExamDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id;

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [studentMarks, setStudentMarks] = useState([]);
  const [marksLoading, setMarksLoading] = useState(false);

  useEffect(() => {
    if (examId) {
      fetchExam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  const fetchExam = async () => {
    setLoading(true);
    try {
      const data = await examApi.getById(examId);
      if (data.success) {
        setExam(data.data);
      }
    } catch (error) {
      message.error('Failed to fetch exam details');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentMarks = () => {
    // Student marks are already included in the exam data from backend
    if (activeTab === 'marks' && exam?.studentMarks) {
      setStudentMarks(exam.studentMarks);
    }
  };

  useEffect(() => {
    fetchStudentMarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, examId]);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!exam) {
    return (
      <Card>
        <Text>Exam not found</Text>
        <Button onClick={() => router.back()}>Back</Button>
      </Card>
    );
  }

  const Overview = () => (
    <Row gutter={[24, 24]}>
      {/* Exam Stats */}
      <Col xs={24} md={6}>
        <Card style={{ borderRadius: 12 }}>
          <Statistic
            title="Total Students"
            value={exam.studentMarks?.length || 0}
            prefix={<TeamOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} md={6}>
        <Card style={{ borderRadius: 12 }}>
          <Statistic
            title="Appeared"
            value={exam.studentMarks?.filter(m => m.status === 'appeared').length || 0}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} md={6}>
        <Card style={{ borderRadius: 12 }}>
          <Statistic
            title="Passed"
            value={exam.studentMarks?.filter(m => m.isPassed).length || 0}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} md={6}>
        <Card style={{ borderRadius: 12 }}>
          <Statistic
            title="Highest Score"
            value={exam.statistics?.highestMarks || 0}
            suffix={`/${exam.totalMarks}`}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>

      {/* Exam Information */}
      <Col xs={24} lg={12}>
        <Card title="Exam Information" style={{ borderRadius: 12 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Subject">
              <Tag color="blue">{exam.subject}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Exam Type">
              <Tag color="purple">{exam.examType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Date">
              {dayjs(exam.examDate).format('DD MMM YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Time">
              {exam.startTime} - {exam.endTime}
            </Descriptions.Item>
            <Descriptions.Item label="Class">
              {exam.class} - {exam.section}
            </Descriptions.Item>
            <Descriptions.Item label="Room">
              {exam.room || 'Not assigned'}
            </Descriptions.Item>
            <Descriptions.Item label="Total Marks">
              {exam.totalMarks}
            </Descriptions.Item>
            <Descriptions.Item label="Passing Marks">
              {exam.passingMarks}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>

      {/* Statistics */}
      <Col xs={24} lg={12}>
        <Card title="Exam Statistics" style={{ borderRadius: 12 }}>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <div style={{ textAlign: 'center' }}>
                <Progress
                  type="circle"
                  percent={exam.statistics?.passPercentage || 0}
                  format={(percent) => `${percent}%`}
                  strokeColor="#52c41a"
                  size={80}
                />
                <div style={{ marginTop: 8 }}>
                  <Text strong>Pass Rate</Text>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: 'center' }}>
                <Statistic
                  title="Average Score"
                  value={exam.statistics?.averageMarks || 0}
                  suffix={`/${exam.totalMarks}`}
                  valueStyle={{ fontSize: 18 }}
                />
                <Text type="secondary">Class Average</Text>
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="Highest"
                value={exam.statistics?.highestMarks || 0}
                valueStyle={{ color: '#faad14', fontSize: 16 }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Lowest"
                value={exam.statistics?.lowestMarks || 0}
                valueStyle={{ color: '#ff4d4f', fontSize: 16 }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Average"
                value={exam.statistics?.averageMarks || 0}
                valueStyle={{ color: '#1890ff', fontSize: 16 }}
              />
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );

  const MarksTab = () => {
    const marksColumns = [
      {
        title: 'Roll No.',
        dataIndex: ['student', 'rollNumber'],
        key: 'rollNumber',
        width: 80,
      },
      {
        title: 'Student Name',
        key: 'studentName',
        render: (_, record) => (
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            {record.student?.firstName} {record.student?.lastName}
          </Space>
        ),
      },
      {
        title: 'Marks',
        dataIndex: 'marksObtained',
        key: 'marksObtained',
        render: (marks, record) => (
          <Space>
            <Text strong style={{ fontSize: 16 }}>
              {marks}/{exam.totalMarks}
            </Text>
            {record.grade && (
              <Tag color={record.isPassed ? 'success' : 'error'}>
                {record.grade}
              </Tag>
            )}
          </Space>
        ),
      },
      {
        title: 'Percentage',
        dataIndex: 'percentage',
        key: 'percentage',
        render: (percentage) => `${percentage?.toFixed(1)}%`,
      },
      {
        title: 'Rank',
        dataIndex: 'rank',
        key: 'rank',
        render: (rank) => rank ? `#${rank}` : '-',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
          const colors = {
            appeared: 'success',
            absent: 'error',
            withheld: 'warning',
          };
          return <Tag color={colors[status] || 'default'}>{status?.toUpperCase()}</Tag>;
        },
      },
      {
        title: 'Marked By',
        dataIndex: ['markedBy', 'name'],
        key: 'markedBy',
      },
    ];

    return (
      <Card title="Student Marks" style={{ borderRadius: 12 }}>
        <Table
          columns={marksColumns}
          dataSource={studentMarks}
          loading={marksLoading}
          rowKey="_id"
          pagination={{ pageSize: 20 }}
          scroll={{ x: 800 }}
        />
      </Card>
    );
  };

  const tabItems = [
    { key: 'overview', label: 'Overview', children: <Overview /> },
    { key: 'marks', label: 'Student Marks', children: <MarksTab /> },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title={`${exam.subject} - ${exam.class} ${exam.section}`}
        subtitle={`${exam.examType} • ${dayjs(exam.examDate).format('DD MMM YYYY')}`}
        breadcrumbs={[
          { title: 'Exams', path: '/exams' },
          { title: exam.subject },
        ]}
        backButton
        actions={
          <Space>
            <Button icon={<PrinterOutlined />}>Print Result</Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => router.push(`/exams/${examId}/edit`)}
            >
              Edit Exam
            </Button>
          </Space>
        }
      />

      {/* Exam Header */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={24} align="middle">
          <Col>
            <Avatar
              size={64}
              style={{ background: '#722ed1' }}
              icon={<BookOutlined />}
            />
          </Col>
          <Col flex="auto">
            <Space direction="vertical" size={4}>
              <Space>
                <Title level={3} style={{ marginBottom: 0 }}>
                  {exam.subject} Examination
                </Title>
                <Tag color="blue">{exam.examType}</Tag>
                <Tag color={exam.status === 'completed' ? 'success' : 'processing'}>
                  {exam.status?.toUpperCase()}
                </Tag>
              </Space>
              <Space split={<Divider type="vertical" />} wrap>
                <Text type="secondary">
                  <CalendarOutlined /> {dayjs(exam.examDate).format('DD MMM YYYY')}
                </Text>
                <Text type="secondary">
                  <ClockCircleOutlined /> {exam.startTime} - {exam.endTime}
                </Text>
                <Text type="secondary">
                  <TeamOutlined /> {exam.class} - {exam.section}
                </Text>
                <Text type="secondary">
                  Room: {exam.room || 'Not assigned'}
                </Text>
              </Space>
            </Space>
          </Col>
          <Col>
            <div style={{ textAlign: 'right' }}>
              <Statistic
                title="Total Marks"
                value={exam.totalMarks}
                valueStyle={{ fontSize: 24 }}
              />
              <Text type="secondary">
                Passing: {exam.passingMarks}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} />
    </div>
  );
}