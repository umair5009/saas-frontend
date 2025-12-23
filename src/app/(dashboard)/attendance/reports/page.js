'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Card,
    Row,
    Col,
    Select,
    DatePicker,
    Button,
    List,
    Typography,
    Tag,
    Space,
    Empty,
    Spin
} from 'antd';
import {
    ReloadOutlined,
    UserOutlined,
    TeamOutlined,
    WarningOutlined
} from '@ant-design/icons';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import PageHeader from '@/components/common/PageHeader';
import dayjs from 'dayjs';
import { attendanceApi } from '@/lib/api/attendance';
import { academicApi } from '@/lib/api/academic';

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const COLORS = ['#52c41a', '#ff4d4f', '#faad14', '#1890ff'];

export default function AttendanceReportsPage() {
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);

    // States for RAW report data from API
    const [rawOverallStats, setRawOverallStats] = useState([]);
    const [rawDailyTrend, setRawDailyTrend] = useState([]);
    const [absentees, setAbsentees] = useState({ data: [], count: 0 });
    const [lowAttendance, setLowAttendance] = useState({ data: [], count: 0 });

    // Filters
    const [filters, setFilters] = useState({
        type: 'student',
        classId: undefined,
        dateRange: [dayjs().subtract(30, 'days'), dayjs()]
    });

    // Fetch classes
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await academicApi.getClasses();
                if (res.success) setClasses(res.data || []);
            } catch (error) {
                console.error(error);
            }
        };
        fetchClasses();
    }, []);

    // Transform overall stats for Pie Chart
    const overallStatsData = useMemo(() => {
        if (!rawOverallStats || rawOverallStats.length === 0) return [];

        return rawOverallStats.map(item => ({
            name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
            value: item.count
        }));
    }, [rawOverallStats]);

    // Transform daily trend for Bar Chart
    const dailyTrendData = useMemo(() => {
        if (!rawDailyTrend || rawDailyTrend.length === 0) return [];

        const dateMap = {};

        rawDailyTrend.forEach(item => {
            const date = item._id.date;
            const status = item._id.status;

            if (!dateMap[date]) {
                dateMap[date] = {
                    date,
                    present: 0,
                    absent: 0,
                    late: 0,
                    leave: 0
                };
            }

            dateMap[date][status] = item.count;
        });

        return Object.values(dateMap).sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );
    }, [rawDailyTrend]);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const startDate = filters.dateRange?.[0]?.format('YYYY-MM-DD');
            const endDate = filters.dateRange?.[1]?.format('YYYY-MM-DD');

            let className = undefined;
            if (filters.classId) {
                const cls = classes.find(c => c._id === filters.classId);
                if (cls) className = filters.classId;
            }

            // 1. Get Main Report (Stats & Trend)
            const reportRes = await attendanceApi.getReport({
                type: filters.type,
                startDate,
                endDate,
                class: className
            });

            console.log('📊 Report API Response:', reportRes);

            if (reportRes.success) {
                setRawOverallStats(reportRes.data.overallStats || []);
                setRawDailyTrend(reportRes.data.dailyTrend || []);
            }

            // 2. Get Absentees
            const absenteesRes = await attendanceApi.getAbsentees({
                date: endDate || dayjs().format('YYYY-MM-DD'),
                type: filters.type,
                class: className
            });

            if (absenteesRes.success) {
                setAbsentees({ data: absenteesRes.data, count: absenteesRes.count });
            }

            // 3. Get Low Attendance (Students only)
            if (filters.type === 'student') {
                const lowAttRes = await attendanceApi.getLowAttendance({
                    threshold: 75,
                    class: className
                });

                if (lowAttRes.success) {
                    setLowAttendance({ data: lowAttRes.data, count: lowAttRes.count });
                }
            } else {
                setLowAttendance({ data: [], count: 0 });
            }

        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, classes]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    console.log('📈 Transformed Data:', { overallStatsData, dailyTrendData });

    return (
        <div className="fade-in">
            <PageHeader
                title="Attendance Reports"
                subtitle="Analytics and Statistics"
                breadcrumbs={[
                    { title: 'Attendance', href: '/attendance' },
                    { title: 'Reports' }
                ]}
            />

            {/* Filters */}
            <Card style={{ marginBottom: 24, borderRadius: 12 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={4}>
                        <Select
                            value={filters.type}
                            onChange={(val) => setFilters(prev => ({ ...prev, type: val }))}
                            style={{ width: '100%' }}
                        >
                            <Option value="student">Student</Option>
                            <Option value="staff">Staff</Option>
                        </Select>
                    </Col>

                    {filters.type === 'student' && (
                        <Col xs={24} md={6}>
                            <Select
                                placeholder="All Classes"
                                allowClear
                                style={{ width: '100%' }}
                                value={filters.classId}
                                onChange={(val) => setFilters(prev => ({ ...prev, classId: val }))}
                            >
                                {classes.map((cls) => (
                                    <Option key={cls._id} value={cls._id}>{cls.name}</Option>
                                ))}
                            </Select>
                        </Col>
                    )}

                    <Col xs={24} md={8}>
                        <RangePicker
                            value={filters.dateRange}
                            onChange={(val) => setFilters(prev => ({ ...prev, dateRange: val }))}
                            style={{ width: '100%' }}
                        />
                    </Col>

                    <Col flex="auto" style={{ textAlign: 'right' }}>
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={fetchReports}
                            loading={loading}
                            shape="circle"
                        />
                    </Col>
                </Row>
            </Card>

            {/* Charts Section */}
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                {/* Pie Chart: Overall Distribution */}
                <Col xs={24} lg={8}>
                    <Card title="Overall Distribution" bordered={false} style={{ borderRadius: 12, height: 400 }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
                                <Spin />
                            </div>
                        ) : overallStatsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <PieChart>
                                    <Pie
                                        data={overallStatsData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={(entry) => `${entry.name}: ${entry.value}`}
                                    >
                                        {overallStatsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <Empty description="No attendance data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </Card>
                </Col>

                {/* Bar Chart: Daily Trend */}
                <Col xs={24} lg={16}>
                    <Card title="Daily Attendance Trend" bordered={false} style={{ borderRadius: 12, height: 400 }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
                                <Spin />
                            </div>
                        ) : dailyTrendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart
                                    data={dailyTrendData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(val) => dayjs(val).format('DD MMM')}
                                    />
                                    <YAxis />
                                    <Tooltip labelFormatter={(val) => dayjs(val).format('DD MMM YYYY')} />
                                    <Legend />
                                    <Bar dataKey="present" stackId="a" fill="#52c41a" name="Present" />
                                    <Bar dataKey="absent" stackId="a" fill="#ff4d4f" name="Absent" />
                                    <Bar dataKey="late" stackId="a" fill="#faad14" name="Late" />
                                    <Bar dataKey="leave" stackId="a" fill="#1890ff" name="Leave" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <Empty description="No trend data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Lists Section */}
            <Row gutter={[24, 24]}>
                {/* Today's Absentees */}
                <Col xs={24} md={12}>
                    <Card
                        title={
                            <Space>
                                <TeamOutlined style={{ color: '#ff4d4f' }} />
                                <span>Absentees ({filters.dateRange?.[1]?.format('DD MMM')})</span>
                                <Tag color="error">{absentees.count}</Tag>
                            </Space>
                        }
                        style={{ borderRadius: 12, minHeight: 400 }}
                    >
                        <List
                            loading={loading}
                            itemLayout="horizontal"
                            dataSource={absentees.data.slice(0, 5)}
                            locale={{ emptyText: 'No absentees' }}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <div style={{
                                                width: 32,
                                                height: 32,
                                                background: '#fff0f6',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <UserOutlined style={{ color: '#eb2f96' }} />
                                            </div>
                                        }
                                        title={
                                            <Text strong>
                                                {item.student ? `${item.student.firstName} ${item.student.lastName}` : item.staff?.fullName}
                                            </Text>
                                        }
                                        description={
                                            item.student
                                                ? `${item.class?.name} - ${item.section}`
                                                : item.staff?.department
                                        }
                                    />
                                    <Tag color="error">{item.status}</Tag>
                                </List.Item>
                            )}
                        />
                        {absentees.count > 5 && (
                            <div style={{ textAlign: 'center', marginTop: 12 }}>
                                <Text type="secondary">+{absentees.count - 5} more</Text>
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Low Attendance (Students only) */}
                {filters.type === 'student' && (
                    <Col xs={24} md={12}>
                        <Card
                            title={
                                <Space>
                                    <WarningOutlined style={{ color: '#faad14' }} />
                                    <span>Low Attendance {'<'} 75%</span>
                                    <Tag color="warning">{lowAttendance.count}</Tag>
                                </Space>
                            }
                            style={{ borderRadius: 12, minHeight: 400 }}
                        >
                            <List
                                loading={loading}
                                itemLayout="horizontal"
                                dataSource={lowAttendance.data.slice(0, 5)}
                                locale={{ emptyText: 'No students with low attendance' }}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={<Text strong>{item.firstName} {item.lastName}</Text>}
                                            description={`${item.class?.name || item.class} - ${item.section}`}
                                        />
                                        <div style={{ textAlign: 'right' }}>
                                            <Text strong style={{ color: '#faad14', fontSize: 16 }}>
                                                {item.attendancePercentage || 0}%
                                            </Text>
                                            <div style={{ fontSize: 11, color: '#999' }}>Attendance</div>
                                        </div>
                                    </List.Item>
                                )}
                            />
                            {lowAttendance.count > 5 && (
                                <div style={{ textAlign: 'center', marginTop: 12 }}>
                                    <Text type="secondary">+{lowAttendance.count - 5} more</Text>
                                </div>
                            )}
                        </Card>
                    </Col>
                )}
            </Row>
        </div>
    );
}
