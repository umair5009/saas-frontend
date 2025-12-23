'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, Typography, Row, Col, Table, Tag, Statistic, Spin, Button, Divider } from 'antd';
import { PrinterOutlined, HomeOutlined, UserOutlined, BookOutlined, TrophyOutlined } from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { studentApi } from '@/lib/api';

const { Title, Text } = Typography;

export default function StudentReportCardPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id;
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (studentId) {
      fetchReport();
    }
    // eslint-disable-next-line
  }, [studentId]);

  async function fetchReport() {
    setLoading(true);
    try {
      const { data } = await studentApi.getReportCard(studentId);
      if (data.success) {
        setReport(data.data);
      }
    } catch (e) {
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>;
  if (!report)
    return (
      <Card>
        <Text type="danger">Failed to load report card.</Text>
        <Button onClick={() => router.back()}>Back</Button>
      </Card>
    );

  const columns = [
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
    { title: 'Total Marks', dataIndex: 'totalMarks', key: 'totalMarks' },
    { title: 'Obtained', dataIndex: 'obtainedMarks', key: 'obtainedMarks' },
    { title: 'Grade', dataIndex: 'grade', key: 'grade', render: (g) => <Tag color="blue">{g}</Tag> },
    { title: 'Rank', dataIndex: 'rank', key: 'rank' },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title={`Report Card: ${report.student?.firstName || ''} ${report.student?.lastName || ''}`}
        subtitle={`Session: ${report.session}, Exam: ${report.exam}`}
        breadcrumbs={[
          { title: 'Students', path: '/students' },
          { title: 'Report Card' },
        ]}
        backButton
        actions={
          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>Print</Button>
        }
      />
      <Card style={{ borderRadius: 12, maxWidth: 960, margin: '0 auto' }}>
        <Row gutter={24} align="middle" style={{ marginBottom: 24 }}>
          <Col flex="32px"><UserOutlined style={{ fontSize: 32, color: '#1890ff' }} /></Col>
          <Col flex="auto">
            <Title level={4} style={{ marginBottom: 0 }}>{report.student?.firstName} {report.student?.lastName}</Title>
            <Text>Admission #: {report.student?.admissionNumber}</Text><br />
            <Text strong>{report.student?.class} - {report.student?.section}, Roll: {report.student?.rollNumber}</Text>
          </Col>
          <Col>
            <Statistic title="Overall %" value={report.totalPercentage} suffix="%" />
          </Col>
        </Row>
        <Divider/><Table columns={columns} dataSource={report.subjects || []} pagination={false} rowKey="subject" />
        <Divider />
        <Row gutter={32} style={{ marginBottom: 18 }}>
          <Col><Statistic title="Total Marks" value={report.totalMarks} /></Col>
          <Col><Statistic title="Obtained" value={report.obtainedMarks} /></Col>
          <Col><Statistic title="Grade" value={report.grade} /></Col>
          <Col><Statistic title="Rank" value={report.rank} /></Col>
        </Row>
        {report.remarks && <><Divider/><Text type="success">Remarks: {report.remarks}</Text></>}
      </Card>
    </div>
  );
}
