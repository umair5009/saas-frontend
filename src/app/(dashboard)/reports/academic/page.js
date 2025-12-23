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
  DatePicker,
  Select,
  message,
  Divider,
  Typography,
  Table,
  Statistic,
  Progress,
  Spin,
  Tag,
} from 'antd';
import {
  BookOutlined,
  DownloadOutlined,
  PrinterOutlined,
  TrophyOutlined,
  BarChartOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { reportsApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function AcademicReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    academicYear: '2024-2025',
    class: 'all',
    subject: 'all',
    reportType: 'performance',
  });

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = {
        academicYear: filters.academicYear,
        class: filters.class,
        subject: filters.subject,
        type: filters.reportType,
      };

      const { data } = await reportsApi.getAcademic(params);
      if (data.success) {
        setReportData(data.data);
      }
    } catch (error) {
      message.error('Failed to generate academic report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportReport = async (format) => {
    try {
      await reportsApi.exportAcademic({
        ...filters,
        format,
      });
      message.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      message.error('Failed to export report');
    }
  };

  const topPerformersColumns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank) => (
        <Tag color={rank <= 3 ? 'gold' : rank <= 10 ? 'blue' : 'default'}>
          #{rank}
        </Tag>
      ),
    },
    {
      title: 'Student Name',
      key: 'student',
      render: (_, record) => `${record.student.firstName} ${record.student.lastName}`,
    },
    {
      title: 'Class',
      key: 'class',
      render: (_, record) => `${record.student.class} - ${record.student.section}`,
    },
    {
      title: 'Average Score',
      dataIndex: 'averageScore',
      key: 'averageScore',
      render: (score) => `${score?.toFixed(1)}%`,
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade) => <Tag color="blue">{grade}</Tag>,
    },
    {
      title: 'Subjects',
      dataIndex: 'totalSubjects',
      key: 'totalSubjects',
    },
  ];

  const subjectAnalysisColumns = [
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Average Score',
      dataIndex: 'averageScore',
      key: 'averageScore',
      render: (score) => `${score?.toFixed(1)}%`,
    },
    {
      title: 'Highest Score',
      dataIndex: 'highestScore',
      key: 'highestScore',
      render: (score) => `${score?.toFixed(1)}%`,
    },
    {
      title: 'Lowest Score',
      dataIndex: 'lowestScore',
      key: 'lowestScore',
      render: (score) => `${score?.toFixed(1)}%`,
    },
    {
      title: 'Pass Rate',
      dataIndex: 'passRate',
      key: 'passRate',
      render: (rate) => `${rate?.toFixed(1)}%`,
    },
    {
      title: 'Students',
      dataIndex: 'totalStudents',
      key: 'totalStudents',
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Academic Reports"
        subtitle="Student performance analysis and academic insights"
        breadcrumbs={[
          { title: 'Reports', path: '/reports' },
          { title: 'Academic' },
        ]}
        backButton
        actions={
          <Space>
            <Button icon={<DownloadOutlined />} onClick={() => exportReport('pdf')}>
              Export PDF
            </Button>
            <Button icon={<DownloadOutlined />} onClick={() => exportReport('excel')}>
              Export Excel
            </Button>
            <Button icon={<PrinterOutlined />}>
              Print
            </Button>
          </Space>
        }
      />

      {/* Filters */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={6}>
            <Select
              value={filters.academicYear}
              onChange={(value) => handleFilterChange('academicYear', value)}
              style={{ width: '100%' }}
            >
              <Option value="2023-2024">2023-2024</Option>
              <Option value="2024-2025">2024-2025</Option>
              <Option value="2025-2026">2025-2026</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              value={filters.class}
              onChange={(value) => handleFilterChange('class', value)}
              style={{ width: '100%' }}
            >
              <Option value="all">All Classes</Option>
              {Array(12).fill(null).map((_, i) => (
                <Option key={`Class ${i + 1}`} value={`Class ${i + 1}`}>Class {i + 1}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              value={filters.subject}
              onChange={(value) => handleFilterChange('subject', value)}
              style={{ width: '100%' }}
            >
              <Option value="all">All Subjects</Option>
              <Option value="Mathematics">Mathematics</Option>
              <Option value="English">English</Option>
              <Option value="Urdu">Urdu</Option>
              <Option value="Science">Science</Option>
              <Option value="Social Studies">Social Studies</Option>
              <Option value="Islamiyat">Islamiyat</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              value={filters.reportType}
              onChange={(value) => handleFilterChange('reportType', value)}
              style={{ width: '100%' }}
            >
              <Option value="performance">Performance Analysis</Option>
              <Option value="top-performers">Top Performers</Option>
              <Option value="subject-analysis">Subject Analysis</Option>
              <Option value="class-comparison">Class Comparison</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Generating academic report...</Text>
          </div>
        </div>
      ) : reportData ? (
        <>
          {/* Summary Cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={6}>
              <Card style={{ borderRadius: 12 }}>
                <Statistic
                  title="Total Students"
                  value={reportData.totalStudents || 0}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card style={{ borderRadius: 12 }}>
                <Statistic
                  title="Average Score"
                  value={reportData.overallAverage || 0}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card style={{ borderRadius: 12 }}>
                <Statistic
                  title="Pass Rate"
                  value={reportData.overallPassRate || 0}
                  suffix="%"
                  valueStyle={{ color: '#faad14' }}
                />
                <Progress
                  percent={reportData.overallPassRate || 0}
                  showInfo={false}
                  strokeColor="#faad14"
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card style={{ borderRadius: 12 }}>
                <Statistic
                  title="Top Performer"
                  value={reportData.topScore || 0}
                  suffix="%"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Report Content Based on Type */}
          {filters.reportType === 'top-performers' && reportData.topPerformers && (
            <Card title="Top Performers" style={{ borderRadius: 12 }}>
              <Table
                columns={topPerformersColumns}
                dataSource={reportData.topPerformers}
                pagination={{ pageSize: 20 }}
                rowKey="_id"
              />
            </Card>
          )}

          {filters.reportType === 'subject-analysis' && reportData.subjectAnalysis && (
            <Card title="Subject-wise Analysis" style={{ borderRadius: 12 }}>
              <Table
                columns={subjectAnalysisColumns}
                dataSource={reportData.subjectAnalysis}
                pagination={false}
                rowKey="subject"
              />
            </Card>
          )}

          {filters.reportType === 'performance' && reportData.performanceData && (
            <>
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <Card title="Grade Distribution" style={{ borderRadius: 12 }}>
                    {reportData.gradeDistribution && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {Object.entries(reportData.gradeDistribution).map(([grade, data]) => (
                          <div key={grade} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Space>
                              <Tag color="blue" style={{ minWidth: 40, textAlign: 'center' }}>{grade}</Tag>
                              <Text>{data.count} students ({data.percentage?.toFixed(1)}%)</Text>
                            </Space>
                            <Progress
                              percent={data.percentage}
                              showInfo={false}
                              strokeColor="#1890ff"
                              style={{ width: 100 }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="Class Performance Comparison" style={{ borderRadius: 12 }}>
                    {reportData.classPerformance && (
                      <Table
                        columns={[
                          { title: 'Class', dataIndex: 'class', key: 'class' },
                          {
                            title: 'Average Score',
                            dataIndex: 'averageScore',
                            key: 'averageScore',
                            render: (score) => `${score?.toFixed(1)}%`,
                          },
                          {
                            title: 'Pass Rate',
                            dataIndex: 'passRate',
                            key: 'passRate',
                            render: (rate) => `${rate?.toFixed(1)}%`,
                          },
                          { title: 'Students', dataIndex: 'totalStudents', key: 'totalStudents' },
                        ]}
                        dataSource={reportData.classPerformance}
                        pagination={false}
                        size="small"
                        rowKey="class"
                      />
                    )}
                  </Card>
                </Col>
              </Row>
            </>
          )}

          {filters.reportType === 'class-comparison' && reportData.classComparison && (
            <Card title="Detailed Class Comparison" style={{ borderRadius: 12 }}>
              <Table
                columns={[
                  { title: 'Class', dataIndex: 'class', key: 'class' },
                  { title: 'Students', dataIndex: 'students', key: 'students' },
                  {
                    title: 'Average Score',
                    dataIndex: 'averageScore',
                    key: 'averageScore',
                    render: (score) => `${score?.toFixed(1)}%`,
                  },
                  {
                    title: 'Highest Score',
                    dataIndex: 'highestScore',
                    key: 'highestScore',
                    render: (score) => `${score?.toFixed(1)}%`,
                  },
                  {
                    title: 'Pass Rate',
                    dataIndex: 'passRate',
                    key: 'passRate',
                    render: (rate) => `${rate?.toFixed(1)}%`,
                  },
                  {
                    title: 'Grade Distribution',
                    dataIndex: 'gradeDistribution',
                    key: 'gradeDistribution',
                    render: (dist) => (
                      <Space>
                        {Object.entries(dist || {}).slice(0, 3).map(([grade, count]) => (
                          <Tag key={grade} size="small">{grade}: {count}</Tag>
                        ))}
                      </Space>
                    ),
                  },
                ]}
                dataSource={reportData.classComparison}
                pagination={{ pageSize: 12 }}
                rowKey="class"
              />
            </Card>
          )}
        </>
      ) : (
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: 48 }}>
          <BarChartOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
          <Title level={4} type="secondary">No Data Available</Title>
          <Text type="secondary">
            Select filters to generate academic report
          </Text>
        </Card>
      )}
    </div>
  );
}