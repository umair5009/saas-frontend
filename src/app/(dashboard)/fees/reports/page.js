'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    Row,
    Col,
    Table,
    Button,
    DatePicker,
    Select,
    Tabs,
    Typography,
    Statistic,
    Space,
    Input,
    Tag,
    Divider,
    message,
    Empty
} from 'antd';
import {
    FileTextOutlined,
    UserOutlined,
    SearchOutlined,
    DownloadOutlined,
    PrinterOutlined,
    WarningOutlined,
    PieChartOutlined
} from '@ant-design/icons';
import { feeApi, studentApi, academicApi } from '@/lib/api';
import PageHeader from '@/components/common/PageHeader';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function FeeReportsPage() {
    const [activeTab, setActiveTab] = useState('summary');
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
    const [summaryData, setSummaryData] = useState(null);

    // Defaulters State
    const [defaulters, setDefaulters] = useState([]);
    const [defaulterFilters, setDefaulterFilters] = useState({});
    const [classes, setClasses] = useState([]);

    // Ledger State
    const [ledgerStudent, setLedgerStudent] = useState(null);
    const [ledgerData, setLedgerData] = useState(null);
    const [studentSearchLoading, setStudentSearchLoading] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (activeTab === 'summary') {
            fetchSummary();
        } else if (activeTab === 'defaulters') {
            fetchDefaulters();
        }
    }, [activeTab, dateRange]); // Refetch when tab or date changes

    const fetchClasses = async () => {
        try {
            const response = await academicApi.getClasses();
            if (response.success) setClasses(response.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const params = {};
            if (dateRange) {
                params.startDate = dateRange[0].toISOString();
                params.endDate = dateRange[1].toISOString();
            }
            const response = await feeApi.getSummary(params);
            if (response.success) {
                setSummaryData(response.data);
            }
        } catch (error) {
            message.error('Failed to load summary');
        } finally {
            setLoading(false);
        }
    };

    const fetchDefaulters = async () => {
        setLoading(true);
        try {
            const params = { ...defaulterFilters };
            const response = await feeApi.getDefaulters(params);
            if (response.success) {
                setDefaulters(response.data);
            }
        } catch (error) {
            message.error('Failed to load defaulters list');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchStudent = async (value) => {
        if (!value || value.length < 3) return;
        setStudentSearchLoading(true);
        try {
            const response = await studentApi.getAll({ search: value, limit: 1 });
            if (response.success && response.data.length > 0) {
                const student = response.data[0];
                fetchStudentLedger(student._id);
            } else {
                message.warning('Student not found');
            }
        } catch (error) {
            message.error('Search failed');
        } finally {
            setStudentSearchLoading(false);
        }
    };

    const fetchStudentLedger = async (studentId) => {
        setLoading(true);
        try {
            const response = await feeApi.getStudentLedger(studentId);
            if (response.success) {
                setLedgerData(response.data);
                setLedgerStudent(response.data.student);
            }
        } catch (error) {
            message.error('Failed to load ledger');
        } finally {
            setLoading(false);
        }
    };

    // --- Columns Definitions ---

    const defaulterColumns = [
        { title: 'Student', dataIndex: 'studentName', key: 'studentName' },
        { title: 'Class', dataIndex: 'class', key: 'class', render: (t, r) => `${t} - ${r.section}` },
        { title: 'Invoice #', dataIndex: 'invoiceNumber', key: 'invoiceNumber' },
        { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', render: d => dayjs(d).format('DD MMM YYYY') },
        { title: 'Overdue Days', dataIndex: 'daysOverdue', key: 'daysOverdue', render: d => <Tag color="red">{d} Days</Tag> },
        { title: 'Balance', dataIndex: 'balanceAmount', key: 'balanceAmount', render: a => <Text type="danger">Rs. {a.toLocaleString()}</Text> },
        { title: 'Parent Phone', dataIndex: 'parentPhone', key: 'parentPhone' },
    ];

    const ledgerColumns = [
        { title: 'Date', dataIndex: 'date', key: 'date', render: d => dayjs(d).format('DD MMM YYYY') },
        { title: 'Ref #', dataIndex: 'number', key: 'number' },
        { title: 'Description', dataIndex: 'description', key: 'description' },
        { title: 'Debit', dataIndex: 'debit', key: 'debit', render: a => a ? `Rs. ${a.toLocaleString()}` : '-' },
        { title: 'Credit', dataIndex: 'credit', key: 'credit', render: a => a ? <Text type="success">Rs. {a.toLocaleString()}</Text> : '-' },
        { title: 'Balance', dataIndex: 'balance', key: 'balance', render: a => <Text strong>Rs. {a.toLocaleString()}</Text> },
    ];

    // --- Render Functions ---

    const renderSummary = () => {
        if (!summaryData) return <Empty />;
        const { summary, collectionByMethod, statusDistribution } = summaryData;

        return (
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Statistic title="Total Invoiced" value={summary.totalInvoiced} prefix="Rs." valueStyle={{ color: '#1890ff' }} />
                            </Col>
                            <Col span={8}>
                                <Statistic title="Total Collected" value={summary.totalCollected} prefix="Rs." valueStyle={{ color: '#52c41a' }} />
                            </Col>
                            <Col span={8}>
                                <Statistic title="Total Pending" value={summary.totalPending} prefix="Rs." valueStyle={{ color: '#ff4d4f' }} />
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card title="Collection by Method">
                        {collectionByMethod.map(item => (
                            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                <Text>{item._id?.toUpperCase()}</Text>
                                <Text strong>Rs. {item.amount.toLocaleString()}</Text>
                            </div>
                        ))}
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card title="Invoice Status">
                        {statusDistribution.map(item => (
                            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                <Tag color={item._id === 'paid' ? 'green' : item._id === 'pending' ? 'orange' : 'red'}>
                                    {item._id?.toUpperCase()}
                                </Tag>
                                <Text>{item.count} Invoices</Text>
                            </div>
                        ))}
                    </Card>
                </Col>
            </Row>
        );
    };

    return (
        <div className="fade-in">
            <PageHeader
                title="Fee Reports"
                subtitle="Financial reports, defaulters list, and student ledgers"
                breadcrumbs={[{ title: 'Fees', path: '/fees' }, { title: 'Reports' }]}
                actions={
                    <Space>
                        <RangePicker
                            value={dateRange}
                            onChange={setDateRange}
                            style={{ width: 250 }}
                            allowClear={activeTab !== 'defaulters'}
                        />
                        <Button icon={<PrinterOutlined />}>Print</Button>
                        <Button icon={<DownloadOutlined />}>Export</Button>
                    </Space>
                }
            />

            <Card style={{ borderRadius: 12 }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: 'summary',
                            label: <span><PieChartOutlined /> Financial Summary</span>,
                            children: renderSummary()
                        },
                        {
                            key: 'defaulters',
                            label: <span><WarningOutlined /> Defaulters List</span>,
                            children: (
                                <>
                                    <Row gutter={16} style={{ marginBottom: 16 }}>
                                        <Col span={6}>
                                            <Select
                                                placeholder="Filter by Class"
                                                allowClear
                                                style={{ width: '100%' }}
                                                onChange={val => {
                                                    setDefaulterFilters(prev => ({ ...prev, class: val }));
                                                    // Need to trigger refetch, simplistic way:
                                                    setTimeout(fetchDefaulters, 0);
                                                }}
                                            >
                                                {classes.map(c => <Option key={c._id} value={c.name}>{c.name}</Option>)}
                                            </Select>
                                        </Col>
                                        <Col span={6}>
                                            <Select
                                                placeholder="Min Days Overdue"
                                                allowClear
                                                style={{ width: '100%' }}
                                                onChange={val => {
                                                    setDefaulterFilters(prev => ({ ...prev, minDays: val }));
                                                    setTimeout(fetchDefaulters, 0);
                                                }}
                                            >
                                                <Option value="30">30+ Days</Option>
                                                <Option value="60">60+ Days</Option>
                                                <Option value="90">90+ Days</Option>
                                            </Select>
                                        </Col>
                                        <Col span={4}>
                                            <Button type="primary" onClick={fetchDefaulters} loading={loading}>Apply</Button>
                                        </Col>
                                    </Row>
                                    <Table
                                        columns={defaulterColumns}
                                        dataSource={defaulters}
                                        rowKey="_id"
                                        loading={loading}
                                        pagination={{ pageSize: 20 }}
                                    />
                                </>
                            )
                        },
                        {
                            key: 'ledger',
                            label: <span><FileTextOutlined /> Student Ledger</span>,
                            children: (
                                <>
                                    <div style={{ marginBottom: 24, maxWidth: 500 }}>
                                        <Input.Search
                                            placeholder="Search Student by Admission # or Name"
                                            enterButton="Search"
                                            onSearch={handleSearchStudent}
                                            loading={studentSearchLoading}
                                        />
                                    </div>

                                    {ledgerData ? (
                                        <div className="printable-ledger">
                                            <Card title={`Ledger: ${ledgerData.student.name} (${ledgerData.student.admissionNumber})`}>
                                                <Row style={{ marginBottom: 24 }}>
                                                    <Col span={8}><Text type="secondary">Class:</Text> {ledgerData.student.class} - {ledgerData.student.section}</Col>
                                                    <Col span={8}><Text type="secondary">Father:</Text> {ledgerData.student.fatherName}</Col>
                                                    <Col span={8} style={{ textAlign: 'right' }}>
                                                        <Statistic title="Current Balance" value={ledgerData.currentBalance} precision={2} prefix="Rs." />
                                                    </Col>
                                                </Row>
                                                <Table
                                                    columns={ledgerColumns}
                                                    dataSource={ledgerData.ledger}
                                                    rowKey="id"
                                                    pagination={false}
                                                    size="small"
                                                    summary={() => (
                                                        <Table.Summary.Row>
                                                            <Table.Summary.Cell index={0} colSpan={3}><Text strong>Total Balance</Text></Table.Summary.Cell>
                                                            <Table.Summary.Cell index={3} colSpan={3}><Text strong>Rs. {ledgerData.currentBalance.toLocaleString()}</Text></Table.Summary.Cell>
                                                        </Table.Summary.Row>
                                                    )}
                                                />
                                            </Card>
                                        </div>
                                    ) : (
                                        <Empty description="Search for a student to view ledger" />
                                    )}
                                </>
                            )
                        }
                    ]}
                />
            </Card>
        </div>
    );
}
