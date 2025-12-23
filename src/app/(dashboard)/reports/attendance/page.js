'use client';

import { useState } from 'react';
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Table,
  Spin,
  message,
  Typography,
} from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import PageHeader from '@/components/common/PageHeader';
import { reportsApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text, Title } = Typography;

export default function AttendanceReportPage() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    startDate: dayjs().startOf('month'),
    endDate: dayjs().endOf('month'),
    classId: null,
    sectionId: null,
  });

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: filters.startDate.format('YYYY-MM-DD'),
        endDate: filters.endDate.format('YYYY-MM-DD'),
        classId: filters.classId,
        sectionId: filters.sectionId,
      };
      const response = await reportsApi.getAttendanceReport(params);
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      message.error('Failed to generate attendance report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Attendance Report"
        subtitle="Monitor student attendance patterns and statistics"
        breadcrumbs={[
          { title: 'Reports', path: '/reports' },
          { title: 'Attendance' },
        ]}
      />

      {/* Filters */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={24} align="middle">
          <Col xs={24} md={4}>
            <DatePicker
              style={{ width: '100%' }}
              placeholder="Start Date"
              value={filters.startDate}
              onChange={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
            />
          </Col>
          <Col xs={24} md={4}>
            <DatePicker
              style={{ width: '100%' }}
              placeholder="End Date"
              value={filters.endDate}
              onChange={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Select Class"
              value={filters.classId}
              onChange={(value) => setFilters(prev => ({ ...prev, classId: value }))}
            >
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(cls => (
                <Option key={cls} value={cls}>{`Class ${cls}`}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Select Section"
              value={filters.sectionId}
              onChange={(value) => setFilters(prev => ({ ...prev, sectionId: value }))}
            >
              {['A', 'B', 'C', 'D'].map(section => (
                <Option key={section} value={section}>{`Section ${section}`}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={handleGenerateReport}
              loading={loading}
              style={{ width: '100%' }}
            >
              Generate Report
            </Button>
          </Col>
          <Col xs={24} md={4}>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => message.info('Export functionality coming soon')}
              style={{ width: '100%' }}
            >
              Export
            </Button>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Generating attendance report...</Text>
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
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card style={{ borderRadius: 12 }}>
                <Statistic
                  title="Present Days"
                  value={reportData.presentDays || 0}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card style={{ borderRadius: 12 }}>
                <Statistic
                  title="Absent Days"
                  value={reportData.absentDays || 0}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card style={{ borderRadius: 12 }}>
                <Statistic
                  title="Average Attendance"
                  value={reportData.averageAttendance || 0}
                  suffix="%"
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="Attendance Trend" style={{ borderRadius: 12 }}>
                <LineChart
                  width={400}
                  height={300}
                  data={reportData.trendData || []}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="present" stroke="#3f8600" name="Present" />
                  <Line type="monotone" dataKey="absent" stroke="#cf1322" name="Absent" />
                </LineChart>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Class-wise Attendance" style={{ borderRadius: 12 }}>
                <BarChart
                  width={400}
                  height={300}
                  data={reportData.classData || []}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="class" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attendance" fill="#1890ff" name="Attendance %" />
                </BarChart>
              </Card>
            </Col>
          </Row>

          {/* Detailed Table */}
          <Card title="Detailed Attendance Report" style={{ marginTop: 24, borderRadius: 12 }}>
            <Table
              columns={[
                {
                  title: 'Student Name',
                  dataIndex: 'studentName',
                  key: 'studentName',
                },
                {
                  title: 'Roll Number',
                  dataIndex: 'rollNumber',
                  key: 'rollNumber',
                },
                {
                  title: 'Total Days',
                  dataIndex: 'totalDays',
                  key: 'totalDays',
                },
                {
                  title: 'Present',
                  dataIndex: 'present',
                  key: 'present',
                },
                {
                  title: 'Absent',
                  dataIndex: 'absent',
                  key: 'absent',
                },
                {
                  title: 'Attendance %',
                  dataIndex: 'attendancePercentage',
                  key: 'attendancePercentage',
                  render: (value) => `${value}%`,
                },
              ]}
              dataSource={reportData.studentData || []}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </Card>
        </>
      ) : (
        <Card style={{ textAlign: 'center', borderRadius: 12 }}>
          <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
          <Title level={4}>No Report Generated</Title>
          <Text type="secondary">
            Select filters and click "Generate Report" to view attendance statistics
          </Text>
        </Card>
      )}
    </div>
  );
}
