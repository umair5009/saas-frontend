'use client';

import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Space, Progress, Table, Tag, Avatar, message } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  BookOutlined,
  CalendarOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import PageHeader from '@/components/common/PageHeader';
import { dashboardApi } from '@/lib/api';
import { useAuthStore } from '@/store';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1'];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [feeData, setFeeData] = useState([]);
  const [classDistribution, setClassDistribution] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await dashboardApi.getStats();
      console.log(response)
      if (response?.success) {
        const data = response?.data;
        setStats({
          totalStudents: data?.students?.total || 0,
          totalStaff: data?.staff?.total || 0,
          totalFeeCollected: data?.fees?.totalCollected || 0,
          pendingFees: data?.fees?.totalPending || 0,
          attendanceRate: data?.attendanceToday?.length > 0
            ? ((data?.attendanceToday.find(a => a._id === 'present')?.count || 0) /
              data?.attendanceToday.reduce((sum, a) => sum + a.count, 0) * 100).toFixed(1)
            : 0,
          newAdmissions: 0, // Not in current API response
        });

        setRecentActivities(data.recentActivities || []);
        setAttendanceData(data.attendanceData || []);
        setFeeData(data.feeData || []);
        setClassDistribution(data.classDistribution || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set mock data on error for demo
      setStats({
        totalStudents: 325,
        totalStaff: 45,
        totalFeeCollected: 2850000,
        pendingFees: 450000,
        attendanceRate: 92.5,
        newAdmissions: 28,
      });

      setAttendanceData([
        { date: 'Mon', students: 92, staff: 98 },
        { date: 'Tue', students: 88, staff: 96 },
        { date: 'Wed', students: 94, staff: 100 },
        { date: 'Thu', students: 91, staff: 98 },
        { date: 'Fri', students: 89, staff: 95 },
      ]);

      setFeeData([
        { month: 'Jan', collected: 2500000, pending: 400000 },
        { month: 'Feb', collected: 2800000, pending: 350000 },
        { month: 'Mar', collected: 2600000, pending: 500000 },
      ]);

      setClassDistribution([
        { name: 'Primary (1-5)', value: 150, color: '#1890ff' },
        { name: 'Middle (6-8)', value: 100, color: '#52c41a' },
        { name: 'High (9-10)', value: 75, color: '#faad14' },
      ]);

      setRecentActivities([
        { id: 1, action: 'New student admitted', user: 'Admin', time: '10 min ago', type: 'success' },
        { id: 2, action: 'Fee collected Rs. 15,000', user: 'Accountant', time: '25 min ago', type: 'info' },
        { id: 3, action: 'Marks entry completed', user: 'Teacher', time: '1 hour ago', type: 'success' },
        { id: 4, action: 'Attendance marked', user: 'Teacher', time: '2 hours ago', type: 'info' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, prefix, suffix, icon, trend, trendValue, color = '#1890ff' }) => (
    <Card style={{ borderRadius: 12 }} loading={loading}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Text type="secondary" style={{ fontSize: 14 }}>{title}</Text>
          <div style={{ fontSize: 28, fontWeight: 600, marginTop: 8 }}>
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </div>
          {trend && (
            <Space style={{ marginTop: 8 }}>
              <Tag color={trend === 'up' ? 'success' : 'error'} style={{ margin: 0 }}>
                {trend === 'up' ? <RiseOutlined /> : <FallOutlined />} {trendValue}%
              </Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>vs last month</Text>
            </Space>
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

  return (
    <div className="fade-in">
      <PageHeader
        title={`Welcome, ${user?.name || 'Admin'}!`}
        subtitle={`Here's what's happening at your school today - ${dayjs().format('dddd, DD MMMM YYYY')}`}
        breadcrumbs={[{ title: 'Dashboard' }]}
      />

      {/* Stats Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<TeamOutlined style={{ fontSize: 28, color: '#1890ff' }} />}
            trend="up"
            trendValue={5.2}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Staff"
            value={stats.totalStaff}
            icon={<UserOutlined style={{ fontSize: 28, color: '#52c41a' }} />}
            trend="up"
            trendValue={2.1}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Fee Collected"
            value={stats.totalFeeCollected}
            prefix="Rs. "
            icon={<DollarOutlined style={{ fontSize: 28, color: '#faad14' }} />}
            trend="up"
            trendValue={12.5}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Attendance Rate"
            value={stats.attendanceRate}
            suffix="%"
            icon={<CalendarOutlined style={{ fontSize: 28, color: '#722ed1' }} />}
            trend="up"
            trendValue={1.8}
            color="#722ed1"
          />
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Fee Collection Trend" style={{ borderRadius: 12 }} loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={feeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v) => `Rs. ${v.toLocaleString()}`} />
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
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Student Distribution" style={{ borderRadius: 12 }} loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={classDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {classDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities & Quick Stats */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Recent Activities" style={{ borderRadius: 12 }} loading={loading}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {recentActivities.map((activity, index) => (
                <div key={activity._id || index + 1} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar
                    size={40}
                    style={{
                      background: activity.type === 'success' ? '#52c41a15' : '#1890ff15',
                    }}
                    icon={<ClockCircleOutlined style={{ color: activity.type === 'success' ? '#52c41a' : '#1890ff' }} />}
                  />
                  <Text>{activity.action}</Text>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                    by {activity.user?.name || 'Unknown User'} •{' '}
                  </div>

                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Today's Attendance" style={{ borderRadius: 12 }} loading={loading}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8 }}>
                  <Statistic
                    title="Students Present"
                    value={Math.round((stats.totalStudents || 0) * 0.92)}
                    suffix={`/ ${stats.totalStudents || 0}`}
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <Progress percent={92} strokeColor="#52c41a" showInfo={false} />
                </Card>
              </Col>
              <Col span={12}>
                <Card style={{ background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: 8 }}>
                  <Statistic
                    title="Staff Present"
                    value={Math.round((stats.totalStaff || 0) * 0.98)}
                    suffix={`/ ${stats.totalStaff || 0}`}
                    valueStyle={{ color: '#1890ff' }}
                  />
                  <Progress percent={98} strokeColor="#1890ff" showInfo={false} />
                </Card>
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Pending Fee Collection</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <Progress
                  percent={Math.round(((stats.totalFeeCollected || 0) / ((stats.totalFeeCollected || 0) + (stats.pendingFees || 1))) * 100)}
                  strokeColor="#52c41a"
                  trailColor="#ff4d4f30"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <Text type="success">Collected: Rs. {(stats.totalFeeCollected || 0).toLocaleString()}</Text>
                <Text type="danger">Pending: Rs. {(stats.pendingFees || 0).toLocaleString()}</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
