'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Table,
  Typography,
  Progress,
  Dropdown,
  Modal,
  message,
  Tabs,
  Statistic,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  CalendarOutlined,
  BookOutlined,
  TrophyOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { examApi } from '@/lib/api';

const { Title, Text } = Typography;
const { Option } = Select;

const statusColors = {
  draft: 'default',
  scheduled: 'blue',
  ongoing: 'orange',
  'marks-entry': 'purple',
  completed: 'cyan',
  published: 'green',
  cancelled: 'red',
};

export default function ExamsPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schedules');

  const handleDeleteSchedule = async (id) => {
    Modal.confirm({
      title: 'Delete Exam Schedule',
      content: 'Are you sure you want to delete this exam schedule? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await examApi.deleteSchedule(id);
          message.success('Exam schedule deleted successfully');
          fetchData();
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to delete exam schedule');
        }
      },
    });
  };

  const handleDeleteExam = async (id) => {
    Modal.confirm({
      title: 'Delete Exam',
      content: 'Are you sure you want to delete this exam?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await examApi.delete(id);
          message.success('Exam deleted successfully');
          fetchData();
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to delete exam');
        }
      },
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch exam schedules from backend
      const schedulesResponse = await examApi.getSchedules();
      console.log('📋 Schedules API Response:', schedulesResponse);

      if (schedulesResponse.success) {
        setSchedules(schedulesResponse.data || []);
        console.log('✅ Schedules set:', schedulesResponse.data);
      } else {
        console.log('❌ Schedules API returned success=false');
      }

      // Fetch individual exams from backend
      const examsResponse = await examApi.getAll();
      console.log('📝 Exams API Response:', examsResponse);

      if (examsResponse.success) {
        // Process exams to add calculated fields
        const processedExams = (examsResponse.data || []).map(exam => ({
          ...exam,
          marksEntered: exam.studentMarks?.filter(m => m.marksObtained !== null).length || 0,
          totalStudents: exam.studentMarks?.length || exam.statistics?.totalStudents || 0,
        }));
        setExams(processedExams);
        console.log('✅ Exams set:', processedExams);
      } else {
        console.log('❌ Exams API returned success=false');
      }
    } catch (error) {
      console.error('Error fetching exam data:', error);
      message.error(error.response?.data?.message || 'Failed to fetch exam data');
    } finally {
      setLoading(false);
    }
  };

  // Schedule columns
  const scheduleColumns = [
    {
      title: 'Exam Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <Text strong>{name}</Text>
          <div>
            <Tag color="blue">{record.examType}</Tag>
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
              {record.academicYear}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Classes',
      dataIndex: 'classes',
      key: 'classes',
      render: (classes) => classes.join(', '),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, record) => {
        const start = new Date(record.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const end = new Date(record.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${start} - ${end}`;
      },
    },
    {
      title: 'Exams',
      key: 'examsCount',
      render: (_, record) => {
        const count = exams.filter(e => e.examSchedule?._id === record._id || e.examSchedule === record._id).length;
        return <Tag>{count} Exams</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]}>{status?.replace('-', ' ').toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View Details',
                onClick: () => router.push(`/exams/schedules/${record._id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
              },
              {
                key: 'exams',
                icon: <BookOutlined />,
                label: 'Manage Exams',
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Delete',
                danger: true,
                onClick: () => handleDeleteSchedule(record._id),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // Exam columns
  const examColumns = [
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject, record) => (
        <div>
          <Text strong>{subject}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.class} - {record.section}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Schedule',
      dataIndex: 'schedule',
      key: 'schedule',
    },
    {
      title: 'Date',
      dataIndex: 'examDate',
      key: 'examDate',
    },
    {
      title: 'Marks',
      key: 'marks',
      render: (_, record) => `${record.totalMarks} (Pass: ${record.passingMarks})`,
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => (
        <div style={{ width: 120 }}>
          <Progress
            percent={Math.round((record.marksEntered / record.totalStudents) * 100)}
            size="small"
            format={() => `${record.marksEntered}/${record.totalStudents}`}
          />
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]}>{status?.replace('-', ' ').toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => router.push(`/exams/${record._id}/marks`)}
            disabled={record.status === 'published'}
          >
            Enter Marks
          </Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'view',
                  icon: <EyeOutlined />,
                  label: 'View Details',
                  onClick: () => router.push(`/exams/${record._id}`),
                },
                {
                  key: 'edit',
                  icon: <EditOutlined />,
                  label: 'Edit',
                  onClick: () => router.push(`/exams/${record._id}/edit`),
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: 'Delete',
                  danger: true,
                  onClick: () => handleDeleteExam(record._id),
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'schedules',
      label: (
        <span>
          <CalendarOutlined /> Exam Schedules
        </span>
      ),
      children: (
        <DataTable
          columns={scheduleColumns}
          dataSource={schedules}
          loading={loading}
          onRefresh={fetchData}
          searchPlaceholder="Search schedules..."
        />
      ),
    },
    {
      key: 'exams',
      label: (
        <span>
          <BookOutlined /> Individual Exams
        </span>
      ),
      children: (
        <DataTable
          columns={examColumns}
          dataSource={exams}
          loading={loading}
          onRefresh={fetchData}
          searchPlaceholder="Search exams..."
        />
      ),
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Examinations"
        subtitle="Manage exam schedules, individual exams, marks entry, and results"
        breadcrumbs={[{ title: 'Examinations' }]}
        actions={
          <Space>
            <Button
              icon={<TrophyOutlined />}
              onClick={() => router.push('/exams/results')}
            >
              View Results
            </Button>
            <Button
              icon={<FileTextOutlined />}
              onClick={() => router.push('/exams/report-cards')}
            >
              Report Cards
            </Button>
            <Button
              icon={<CalendarOutlined />}
              onClick={() => router.push('/exams/schedules')}
            >
              Manage Schedules
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/exams/create')}
            >
              Create Exam
            </Button>
          </Space>
        }
      />

      {/* Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Total Schedules"
              value={schedules.length}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Active Exams"
              value={exams.filter((e) => e.status === 'scheduled' || e.status === 'marks-entry').length}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Marks Entry Pending"
              value={exams.filter((e) => e.status === 'marks-entry').length}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="Published Results"
              value={schedules.filter((s) => s.status === 'published').length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card style={{ borderRadius: 12 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>
    </div>
  );
}

