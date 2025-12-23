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
} from 'antd';
import {
  DollarOutlined,
  DownloadOutlined,
  PrinterOutlined,
  BarChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { reportsApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function FinancialReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: [dayjs().subtract(30, 'days'), dayjs()],
    branch: 'all',
    reportType: 'summary',
  });

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: filters.dateRange[0].format('YYYY-MM-DD'),
        endDate: filters.dateRange[1].format('YYYY-MM-DD'),
        branch: filters.branch,
        type: filters.reportType,
      };

      const { data } = await reportsApi.getFinancial(params);
      if (data.success) {
        setReportData(data.data);
      }
    } catch (error) {
      message.error('Failed to generate financial report');
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
      await reportsApi.exportFinancial({
        ...filters,
        startDate: filters.dateRange[0].format('YYYY-MM-DD'),
        endDate: filters.dateRange[1].format('YYYY-MM-DD'),
        format,
      });
      message.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      message.error('Failed to export report');
    }
  };

  const paymentMethodsColumns = [
    {
      title: 'Payment Method',
      dataIndex: 'method',
      key: 'method',
      render: (method) => method?.replace('-', ' ').toUpperCase(),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `Rs. ${amount?.toLocaleString()}`,
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage) => `${percentage?.toFixed(1)}%`,
    },
  ];

  const feeTypeColumns = [
    {
      title: 'Fee Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => type?.replace('_', ' '),
    },
    {
      title: 'Collected',
      dataIndex: 'collected',
      key: 'collected',
      render: (amount) => `Rs. ${amount?.toLocaleString()}`,
    },
    {
      title: 'Pending',
      dataIndex: 'pending',
      key: 'pending',
      render: (amount) => `Rs. ${amount?.toLocaleString()}`,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (amount) => `Rs. ${amount?.toLocaleString()}`,
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Financial Reports"
        subtitle="Comprehensive financial analysis and reporting"
        breadcrumbs={[
          { title: 'Reports', path: '/reports' },
          { title: 'Financial' },
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
          <Col xs={24} sm={8}>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => handleFilterChange('dateRange', dates)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              value={filters.branch}
              onChange={(value) => handleFilterChange('branch', value)}
              style={{ width: '100%' }}
            >
              <Option value="all">All Branches</Option>
              <Option value="main">Main Campus</Option>
              <Option value="branch-1">Branch 1</Option>
              <Option value="branch-2">Branch 2</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              value={filters.reportType}
              onChange={(value) => handleFilterChange('reportType', value)}
              style={{ width: '100%' }}
            >
              <Option value="summary">Summary Report</Option>
              <Option value="detailed">Detailed Report</Option>
              <Option value="monthly">Monthly Breakdown</Option>
              <Option value="branch-wise">Branch-wise</Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Button type="primary" onClick={generateReport} loading={loading}>
              Generate Report
            </Button>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Generating financial report...</Text>
          </div>
        </div>
      ) : reportData ? (
        <>
          {/* Summary Cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={6}>
              <Card style={{ borderRadius: 12 }}>
                <Statistic
                  title="Total Billed"
                  value={reportData.totalBilled || 0}
                  prefix="Rs."
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card style={{ borderRadius: 12 }}>
                <Statistic
                  title="Total Collected"
                  value={reportData.totalCollected || 0}
                  prefix="Rs."
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card style={{ borderRadius: 12 }}>
                <Statistic
                  title="Pending Amount"
                  value={reportData.totalPending || 0}
                  prefix="Rs."
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card style={{ borderRadius: 12 }}>
                <Statistic
                  title="Collection Rate"
                  value={reportData.collectionRate || 0}
                  suffix="%"
                  valueStyle={{ color: '#722ed1' }}
                />
                <Progress
                  percent={reportData.collectionRate || 0}
                  showInfo={false}
                  strokeColor="#722ed1"
                  size="small"
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            {/* Payment Methods Breakdown */}
            <Col xs={24} lg={12}>
              <Card title="Payment Methods" style={{ borderRadius: 12 }}>
                <Table
                  columns={paymentMethodsColumns}
                  dataSource={reportData.paymentMethods || []}
                  pagination={false}
                  rowKey="method"
                  size="small"
                />
              </Card>
            </Col>

            {/* Fee Types Breakdown */}
            <Col xs={24} lg={12}>
              <Card title="Fee Types Breakdown" style={{ borderRadius: 12 }}>
                <Table
                  columns={feeTypeColumns}
                  dataSource={reportData.feeTypes || []}
                  pagination={false}
                  rowKey="type"
                  size="small"
                />
              </Card>
            </Col>
          </Row>

          {/* Monthly Trends */}
          {reportData.monthlyData && reportData.monthlyData.length > 0 && (
            <Card title="Monthly Collection Trends" style={{ marginTop: 24, borderRadius: 12 }}>
              <Table
                columns={[
                  { title: 'Month', dataIndex: 'month', key: 'month' },
                  {
                    title: 'Billed',
                    dataIndex: 'billed',
                    key: 'billed',
                    render: (amount) => `Rs. ${amount?.toLocaleString()}`,
                  },
                  {
                    title: 'Collected',
                    dataIndex: 'collected',
                    key: 'collected',
                    render: (amount) => `Rs. ${amount?.toLocaleString()}`,
                  },
                  {
                    title: 'Pending',
                    dataIndex: 'pending',
                    key: 'pending',
                    render: (amount) => `Rs. ${amount?.toLocaleString()}`,
                  },
                  {
                    title: 'Collection Rate',
                    dataIndex: 'rate',
                    key: 'rate',
                    render: (rate) => `${rate?.toFixed(1)}%`,
                  },
                ]}
                dataSource={reportData.monthlyData}
                pagination={false}
                rowKey="month"
              />
            </Card>
          )}

          {/* Branch-wise Summary */}
          {reportData.branchData && reportData.branchData.length > 0 && (
            <Card title="Branch-wise Summary" style={{ marginTop: 24, borderRadius: 12 }}>
              <Table
                columns={[
                  { title: 'Branch', dataIndex: 'branch', key: 'branch' },
                  {
                    title: 'Students',
                    dataIndex: 'students',
                    key: 'students',
                  },
                  {
                    title: 'Billed',
                    dataIndex: 'billed',
                    key: 'billed',
                    render: (amount) => `Rs. ${amount?.toLocaleString()}`,
                  },
                  {
                    title: 'Collected',
                    dataIndex: 'collected',
                    key: 'collected',
                    render: (amount) => `Rs. ${amount?.toLocaleString()}`,
                  },
                  {
                    title: 'Pending',
                    dataIndex: 'pending',
                    key: 'pending',
                    render: (amount) => `Rs. ${amount?.toLocaleString()}`,
                  },
                  {
                    title: 'Collection Rate',
                    dataIndex: 'rate',
                    key: 'rate',
                    render: (rate) => `${rate?.toFixed(1)}%`,
                  },
                ]}
                dataSource={reportData.branchData}
                pagination={false}
                rowKey="branch"
              />
            </Card>
          )}
        </>
      ) : (
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: 48 }}>
          <BarChartOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
          <Title level={4} type="secondary">No Data Available</Title>
          <Text type="secondary">
            Select date range and filters to generate financial report
          </Text>
        </Card>
      )}
    </div>
  );
}