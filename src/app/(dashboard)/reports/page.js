'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Select,
  Typography,
  Statistic,
  DatePicker,
  Tabs,
  Table,
  Progress,
  Tag,
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  PrinterOutlined,
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  BookOutlined,
  CalendarOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import PageHeader from '@/components/common/PageHeader';
import { reportsApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2'];

export default function ReportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  
  // Chart data
  const [feeData, setFeeData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [examData, setExamData] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [classDistribution, setClassDistribution] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchReportData();
  }, [dateRange, selectedBranch]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Mock data for charts
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Fee Collection Trend
      setFeeData(months.slice(0, dayjs().month() + 1).map((month, i) => ({
        month,
        collected: 2500000 + Math.random() * 500000,
        pending: 300000 + Math.random() * 200000,
        target: 3000000,
      })));

      // Attendance Trend
      setAttendanceData(months.slice(0, dayjs().month() + 1).map((month) => ({
        month,
        students: 88 + Math.random() * 10,
        staff: 92 + Math.random() * 6,
      })));

      // Exam Performance
      setExamData([
        { subject: 'Math', passed: 85, failed: 15, avg: 72 },
        { subject: 'English', passed: 90, failed: 10, avg: 78 },
        { subject: 'Science', passed: 82, failed: 18, avg: 70 },
        { subject: 'Urdu', passed: 88, failed: 12, avg: 75 },
        { subject: 'Social', passed: 92, failed: 8, avg: 80 },
      ]);

      // Enrollment Trend
      setEnrollmentData(months.map((month, i) => ({
        month,
        admissions: 20 + Math.floor(Math.random() * 30),
        withdrawals: 2 + Math.floor(Math.random() * 8),
      })));

      // Class Distribution
      setClassDistribution([
        { name: 'Class 1-5', value: 450, color: '#1890ff' },
        { name: 'Class 6-8', value: 380, color: '#52c41a' },
        { name: 'Class 9-10', value: 320, color: '#faad14' },
        { name: 'Class 11-12', value: 100, color: '#722ed1' },
      ]);

      // Summary Stats
      setStats({
        totalStudents: 1250,
        studentGrowth: 8.5,
        totalStaff: 85,
        staffGrowth: 3.2,
        feeCollection: 28500000,
        feeGrowth: 12.5,
        attendanceRate: 92.5,
        attendanceChange: 2.1,
        passRate: 87.5,
        examImprovement: 5.3,
      });
    } catch (error) {
      console.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, prefix, suffix, trend, trendValue, icon, color }) => (
    <Card style={{ borderRadius: 12 }} loading={loading}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Text type="secondary" style={{ fontSize: 14 }}>{title}</Text>
          <Statistic
            value={value}
            prefix={prefix}
            suffix={suffix}
            valueStyle={{ fontSize: 28, fontWeight: 600 }}
          />
          {trend && (
            <div style={{ marginTop: 8 }}>
              {trend === 'up' ? (
                <Tag color="success" icon={<RiseOutlined />}>{trendValue}% vs last month</Tag>
              ) : (
                <Tag color="error" icon={<FallOutlined />}>{trendValue}% vs last month</Tag>
              )}
            </div>
          )}
        </div>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );

  const Overview = () => (
    <>
      {/* Summary Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            trend="up"
            trendValue={stats.studentGrowth}
            icon={<UserOutlined style={{ fontSize: 28, color: '#1890ff' }} />}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Staff"
            value={stats.totalStaff}
            trend="up"
            trendValue={stats.staffGrowth}
            icon={<TeamOutlined style={{ fontSize: 28, color: '#52c41a' }} />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Fee Collection"
            value={stats.feeCollection}
            prefix="Rs. "
            trend="up"
            trendValue={stats.feeGrowth}
            icon={<DollarOutlined style={{ fontSize: 28, color: '#faad14' }} />}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Attendance Rate"
            value={stats.attendanceRate}
            suffix="%"
            trend="up"
            trendValue={stats.attendanceChange}
            icon={<CalendarOutlined style={{ fontSize: 28, color: '#722ed1' }} />}
            color="#722ed1"
          />
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[24, 24]}>
        {/* Fee Collection Trend */}
        <Col xs={24} lg={16}>
          <Card
            title={<><LineChartOutlined /> Fee Collection Trend</>}
            style={{ borderRadius: 12 }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={feeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v) => `Rs. ${v.toLocaleString()}`} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stackId="1"
                  stroke="#52c41a"
                  fill="#52c41a"
                  fillOpacity={0.6}
                  name="Collected"
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  stackId="1"
                  stroke="#faad14"
                  fill="#faad14"
                  fillOpacity={0.6}
                  name="Pending"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#ff4d4f"
                  strokeDasharray="5 5"
                  name="Target"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Class Distribution */}
        <Col xs={24} lg={8}>
          <Card
            title={<><PieChartOutlined /> Student Distribution</>}
            style={{ borderRadius: 12 }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={classDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {classDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Attendance Trend */}
        <Col xs={24} lg={12}>
          <Card
            title={<><LineChartOutlined /> Attendance Trend</>}
            style={{ borderRadius: 12 }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[80, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#1890ff"
                  strokeWidth={2}
                  name="Students"
                />
                <Line
                  type="monotone"
                  dataKey="staff"
                  stroke="#52c41a"
                  strokeWidth={2}
                  name="Staff"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Exam Performance */}
        <Col xs={24} lg={12}>
          <Card
            title={<><BarChartOutlined /> Exam Performance by Subject</>}
            style={{ borderRadius: 12 }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={examData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis tickFormatter={(v) => `${v}%`} />
                <Tooltip />
                <Legend />
                <Bar dataKey="passed" fill="#52c41a" name="Pass Rate" />
                <Bar dataKey="avg" fill="#1890ff" name="Avg Score" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Enrollment Trend */}
        <Col xs={24}>
          <Card
            title={<><BarChartOutlined /> Monthly Admissions & Withdrawals</>}
            style={{ borderRadius: 12 }}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="admissions" fill="#52c41a" name="New Admissions" />
                <Bar dataKey="withdrawals" fill="#ff4d4f" name="Withdrawals" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </>
  );

  const FeeReports = () => (
    <Card title="Fee Collection Report" style={{ borderRadius: 12 }}>
      <Table
        columns={[
          { title: 'Month', dataIndex: 'month', key: 'month' },
          { 
            title: 'Collected', 
            dataIndex: 'collected', 
            key: 'collected',
            render: (v) => `Rs. ${v.toLocaleString()}`
          },
          { 
            title: 'Pending', 
            dataIndex: 'pending', 
            key: 'pending',
            render: (v) => <Text type="danger">Rs. {v.toLocaleString()}</Text>
          },
          { 
            title: 'Target', 
            dataIndex: 'target', 
            key: 'target',
            render: (v) => `Rs. ${v.toLocaleString()}`
          },
          { 
            title: 'Achievement', 
            key: 'achievement',
            render: (_, r) => (
              <Progress
                percent={Math.round((r.collected / r.target) * 100)}
                size="small"
                status={r.collected >= r.target ? 'success' : 'active'}
              />
            )
          },
        ]}
        dataSource={feeData}
        rowKey="month"
        pagination={false}
      />
    </Card>
  );

  const tabItems = [
    {
      key: 'overview',
      label: <><BarChartOutlined /> Overview</>,
      children: <Overview />,
    },
    {
      key: 'fees',
      label: <><DollarOutlined /> Fee Reports</>,
      children: <FeeReports />,
    },
    {
      key: 'attendance',
      label: <><CalendarOutlined /> Attendance</>,
      children: (
        <Card style={{ borderRadius: 12 }}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[80, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="students" stroke="#1890ff" strokeWidth={2} name="Student Attendance" />
              <Line type="monotone" dataKey="staff" stroke="#52c41a" strokeWidth={2} name="Staff Attendance" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      ),
    },
    {
      key: 'exams',
      label: <><BookOutlined /> Exam Analysis</>,
      children: (
        <Card style={{ borderRadius: 12 }}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={examData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="subject" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="passed" fill="#52c41a" name="Pass Rate %" />
              <Bar dataKey="avg" fill="#1890ff" name="Average Score" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Comprehensive reports and data visualization"
        breadcrumbs={[{ title: 'Reports' }]}
        actions={
          <Space>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: 280 }}
            />
            <Select
              value={selectedBranch}
              onChange={setSelectedBranch}
              style={{ width: 150 }}
            >
              <Option value="all">All Branches</Option>
              <Option value="main">Main Campus</Option>
              <Option value="branch1">DHA Branch</Option>
            </Select>
            <Button icon={<PrinterOutlined />}>Print</Button>
            <Button type="primary" icon={<DownloadOutlined />}>Export</Button>
          </Space>
        }
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
}

