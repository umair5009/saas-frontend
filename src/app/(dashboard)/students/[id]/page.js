'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Row,
  Col,
  Typography,
  Descriptions,
  Avatar,
  Tag,
  Space,
  Button,
  Tabs,
  Table,
  Timeline,
  Statistic,
  Progress,
  message,
  Spin,
  Divider,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  PrinterOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  BookOutlined,
  DollarOutlined,
  TeamOutlined,
  TrophyOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import StatusTag from '@/components/common/StatusTag';
import { studentApi, feeApi, examApi, attendanceApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

export default function StudentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id;

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const data = await studentApi.getById(studentId);
      if (data.success) {
        setStudent(data.data);
      } else {
        message.error('Failed to fetch student details');
        router.push('/students');
      }
    } catch (error) {
      message.error('Failed to fetch student details');
      router.push('/students');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!student) {
    return (
      <Card>
        <Text>Student not found</Text>
      </Card>
    );
  }

  const Overview = () => (
    <Row gutter={[24, 24]}>
      {/* Stats Cards */}
      <Col xs={24} md={6}>
        <Card style={{ borderRadius: 12 }}>
          <Statistic
            title="Attendance"
            value={student.attendanceSummary?.attendancePercentage || 0}
            suffix="%"
            prefix={<CalendarOutlined />}
            valueStyle={{ color: student.attendanceSummary?.attendancePercentage >= 75 ? '#52c41a' : '#ff4d4f' }}
          />
          <Progress
            percent={student.attendanceSummary?.attendancePercentage || 0}
            showInfo={false}
            strokeColor={student.attendanceSummary?.attendancePercentage >= 75 ? '#52c41a' : '#ff4d4f'}
          />
        </Card>
      </Col>
      <Col xs={24} md={6}>
        <Card style={{ borderRadius: 12 }}>
          <Statistic
            title="Fee Paid"
            value={student.feeDetails?.paidAmount || 0}
            prefix="Rs."
            valueStyle={{ color: '#52c41a' }}
          />
          <Text type="secondary">
            Pending: Rs. {(student.feeDetails?.pendingAmount || 0).toLocaleString()}
          </Text>
        </Card>
      </Col>
      <Col xs={24} md={6}>
        <Card style={{ borderRadius: 12 }}>
          <Statistic
            title="Last Exam"
            value={student.academicRecords?.[0]?.percentage || 0}
            suffix="%"
            prefix={<TrophyOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
          <Text type="secondary">
            Grade: {student.academicRecords?.[0]?.grade} | Rank: {student.academicRecords?.[0]?.rank}
          </Text>
        </Card>
      </Col>
      <Col xs={24} md={6}>
        <Card style={{ borderRadius: 12 }}>
          <Statistic
            title="Roll Number"
            value={student.rollNumber}
            prefix={<UserOutlined />}
          />
          <Text type="secondary">{student.class} - {student.section}</Text>
        </Card>
      </Col>

      {/* Attendance & Fee Information */}
      <Col xs={24} lg={12}>
        <Row gutter={[24, 24]}>
          {/* Attendance Card */}
          <Col xs={24} md={12}>
            <Card title="Attendance Summary" style={{ borderRadius: 12, height: '100%' }}>
              <Row justify="center" align="middle" style={{ height: 200 }}>
                <Progress
                  type="circle"
                  percent={student.attendanceSummary?.attendancePercentage || 0}
                  format={percent => `${percent}%`}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </Row>
              <Row gutter={[16, 16]} style={{ marginTop: 24, textAlign: 'center' }}>
                <Col span={8}>
                  <Statistic title="Total Days" value={student.attendanceSummary?.totalDays || 0} />
                </Col>
                <Col span={8}>
                  <Statistic title="Present" value={student.attendanceSummary?.presentDays || 0} valueStyle={{ color: '#3f8600' }} />
                </Col>
                <Col span={8}>
                  <Statistic title="Absent" value={student.attendanceSummary?.absentDays || 0} valueStyle={{ color: '#cf1322' }} />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Fee Information Card */}
          <Col xs={24} md={12}>
            <Card title="Fee & Financials" style={{ borderRadius: 12, height: '100%' }}>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Scholarship">
                  {student.feeDetails?.scholarship ? (
                    <Tag color="gold">
                      {student.feeDetails.scholarship.name} ({student.feeDetails.scholarship.discountValue}{student.feeDetails.scholarship.discountType === 'percentage' ? '%' : ''})
                    </Tag>
                  ) : 'None'}
                </Descriptions.Item>
                <Descriptions.Item label="Discounts">
                  {student.feeDetails?.discounts && student.feeDetails.discounts.length > 0 ? (
                    student.feeDetails.discounts.map(d => (
                      <Tag key={d._id} color="purple">
                        {d.name} ({d.discountValue}{d.discountType === 'percentage' ? '%' : ''})
                      </Tag>
                    ))
                  ) : 'No additional discounts'}
                </Descriptions.Item>
              </Descriptions>
              <Divider />
              <Row gutter={[16, 16]} style={{ textAlign: 'center' }}>
                <Col span={12}>
                  <Statistic title="Total Paid" prefix="Rs." value={student.feeDetails?.paidAmount || 0} valueStyle={{ color: '#3f8600' }} />
                </Col>
                <Col span={12}>
                  <Statistic title="Pending" prefix="Rs." value={student.feeDetails?.pendingAmount || 0} valueStyle={{ color: '#cf1322' }} />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Col>

      {/* Personal Information */}
      <Col xs={24} lg={12}>
        <Card title="Personal Information" style={{ borderRadius: 12 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Date of Birth">
              {dayjs(student.dateOfBirth).format('DD MMM YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Gender">
              {student.gender?.charAt(0).toUpperCase() + student.gender?.slice(1)}
            </Descriptions.Item>
            <Descriptions.Item label="Blood Group">{student.bloodGroup}</Descriptions.Item>
            <Descriptions.Item label="Nationality">{student.nationality}</Descriptions.Item>
            <Descriptions.Item label="Religion">{student.religion}</Descriptions.Item>
            <Descriptions.Item label="Email">{student.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{student.phone}</Descriptions.Item>
          </Descriptions>

          <Divider style={{ margin: '16px 0' }} />

          <Title level={5}><HomeOutlined /> Address</Title>
          <Text>
            {student.address?.street}, {student.address?.city}, {student.address?.state} - {student.address?.postalCode}
          </Text>
        </Card>
      </Col>

      {/* Guardian Information */}
      <Col xs={24} lg={12}>
        <Card title="Guardian Information" style={{ borderRadius: 12 }}>
          {student.guardians?.map((guardian, index) => (
            <div key={index} style={{ marginBottom: index < student.guardians.length - 1 ? 16 : 0 }}>
              <Space>
                <Avatar style={{ background: guardian.type === 'father' ? '#1890ff' : '#eb2f96' }}>
                  {guardian.firstName?.[0]}
                </Avatar>
                <div>
                  <Text strong>{guardian.firstName} {guardian.lastName}</Text>
                  {guardian.isPrimary && <Tag color="green" style={{ marginLeft: 8 }}>Primary</Tag>}
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                    {guardian.type?.charAt(0).toUpperCase() + guardian.type?.slice(1)} • {guardian.occupation}
                  </div>
                </div>
              </Space>
              <div style={{ marginTop: 8, marginLeft: 48 }}>
                <Space direction="vertical" size={0}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <PhoneOutlined /> {guardian.phone}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <MailOutlined /> {guardian.email}
                  </Text>
                </Space>
              </div>
              {index < student.guardians.length - 1 && <Divider style={{ margin: '12px 0' }} />}
            </div>
          ))}

          <Divider style={{ margin: '16px 0' }} />

          <Title level={5}><WarningOutlined /> Emergency Contact</Title>
          <Text>{student.emergencyContact?.name} ({student.emergencyContact?.relation})</Text>
          <br />
          <Text type="secondary"><PhoneOutlined /> {student.emergencyContact?.phone}</Text>
        </Card>
      </Col>
    </Row>
  );

  const AcademicTab = () => (
    <Card title="Academic Records" style={{ borderRadius: 12 }}>
      <Table
        columns={[
          { title: 'Exam', dataIndex: 'examType', key: 'examType' },
          { title: 'Percentage', dataIndex: 'percentage', key: 'percentage', render: (v) => `${v}%` },
          { title: 'Grade', dataIndex: 'grade', key: 'grade', render: (g) => <Tag color="blue">{g}</Tag> },
          { title: 'Rank', dataIndex: 'rank', key: 'rank' },
        ]}
        dataSource={student.academicRecords}
        pagination={false}
        rowKey="examType"
      />
    </Card>
  );

  const tabItems = [
    { key: 'overview', label: 'Overview', children: <Overview /> },
    { key: 'academic', label: 'Academic', children: <AcademicTab /> },
    { key: 'attendance', label: 'Attendance', children: <Card style={{ borderRadius: 12 }}>Attendance details...</Card> },
    { key: 'fees', label: 'Fees', children: <Card style={{ borderRadius: 12 }}>Fee history...</Card> },
    { key: 'documents', label: 'Documents', children: <Card style={{ borderRadius: 12 }}>Documents...</Card> },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        subtitle={`${student.admissionNumber} • ${student.class} - ${student.section}`}
        breadcrumbs={[
          { title: 'Students', path: '/students' },
          { title: `${student.firstName} ${student.lastName}` },
        ]}
        backButton
        actions={
          <Space>
            <Button icon={<PrinterOutlined />}>Print ID Card</Button>
            <Button type="primary" icon={<EditOutlined />} onClick={() => router.push(`/students/${studentId}/edit`)}>
              Edit
            </Button>
          </Space>
        }
      />

      {/* Profile Header */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={24} align="middle">
          <Col>
            <Avatar
              size={100}
              style={{ background: student.gender === 'male' ? '#1890ff' : '#eb2f96' }}
              icon={<UserOutlined />}
            />
          </Col>
          <Col flex="auto">
            <Space direction="vertical" size={4}>
              <Space>
                <Title level={3} style={{ marginBottom: 0 }}>
                  {student.firstName} {student.middleName} {student.lastName}
                </Title>
                <StatusTag status={student.status} />
              </Space>
              <Space split={<Divider type="vertical" />} wrap>
                <Text type="secondary">Admission: {student.admissionNumber}</Text>
                <Text type="secondary">{student.class} - {student.section}</Text>
                <Text type="secondary">Roll: {student.rollNumber}</Text>
                <Text type="secondary">Session: {student.academicYear}</Text>
              </Space>
              <Space size="large" style={{ marginTop: 8 }}>
                <Text><MailOutlined /> {student.email}</Text>
                <Text><PhoneOutlined /> {student.phone}</Text>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
}

