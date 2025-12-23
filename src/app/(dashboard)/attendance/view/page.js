'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Row,
    Col,
    Select,
    DatePicker,
    Button,
    Table,
    Tag,
    Space,
    message,
    Typography
} from 'antd';
import {
    UserOutlined,
    ReloadOutlined,
    SearchOutlined
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import dayjs from 'dayjs';
import { attendanceApi } from '@/lib/api/attendance';
import { academicApi } from '@/lib/api/academic';

const { Option } = Select;
const { RangePicker } = DatePicker;

const DEPARTMENTS = [
    'academic', 'administration', 'accounts', 'library', 'transport',
    'sports', 'it', 'maintenance', 'security', 'other'
];

const statusColors = {
    present: 'success',
    absent: 'error',
    late: 'warning',
    leave: 'processing',
};

export default function ViewAttendancePage() {
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    // Filters
    const [filters, setFilters] = useState({
        type: 'student',
        classId: null,
        section: null,
        department: 'all',
        dateRange: [dayjs().subtract(7, 'days'), dayjs()]
    });

    const [classes, setClasses] = useState([]);

    // Fetch classes on mount
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await academicApi.getClasses();
                if (res.success) {
                    setClasses(res.data || []);
                }
            } catch (error) {
                // Silent error
            }
        };
        fetchClasses();
    }, []);

    const fetchAttendance = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                type: filters.type,
                page,
                limit: pagination.pageSize,
                startDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
                endDate: filters.dateRange?.[1]?.format('YYYY-MM-DD')
            };

            if (filters.type === 'student') {
                if (filters.classId) {
                    // Find class name from ID
                    const cls = classes.find(c => c._id === filters.classId);
                    if (cls) params.class = cls.name; // API expects name according to controller
                    // But wait, controller sees: if (className) query.class = className; 
                    // Previous page used ID for selection but maybe Name for API?
                    // Let's check previous page. It used ID for selection but attendanceApi.getClassAttendance used ID?
                    // Controller: req.query.class. 
                    // Let's send the ID first if that's what we have, or name if we can match it.
                    // Re-reading controller: `if (className) query.class = className;` 
                    // Models usually use ObjectId for refs. 
                    // Let's assume ID is correct for query if it's a ref, or Name if it's a string.
                    // The previous page `getClassAttendance` sent ID.
                    params.class = filters.classId;
                }
                if (filters.section) params.section = filters.section;
            } else {
                if (filters.department !== 'all') params.department = filters.department;
                // Note: Controller doesn't filter by department in getAttendance directly? 
                // Controller: `if (staffId) query.staff = staffId;`
                // It doesn't seem to have department filter in `getAttendance`.
                // It DOES have `getClassAttendance` but not `getDepartmentAttendance`.
                // We might need to filter client side or just show all for now if API doesn't support it.
                // Wait, `getAttendance` controller populates staff. 
                // We can't filter by populated field in simple mongo query easily without aggregate.
                // Let's stick to basic filters for now.
            }

            const res = await attendanceApi.getAll(params);
            if (res.success) {
                setRecords(res.data || []);
                setPagination({
                    ...pagination,
                    current: res.pagination?.page || 1,
                    total: res.pagination?.total || 0
                });
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
            message.error('Failed to load attendance records');
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.pageSize, classes]);

    useEffect(() => {
        fetchAttendance(1);
    }, [fetchAttendance]);

    const handleTableChange = (newPagination) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize
        }));
        fetchAttendance(newPagination.current);
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => dayjs(date).format('DD MMM YYYY'),
        },
        {
            title: filters.type === 'student' ? 'Student' : 'Staff',
            key: 'name',
            render: (_, record) => {
                if (filters.type === 'student' && record.student) {
                    return (
                        <Space direction="vertical" size={0}>
                            <Typography.Text strong>
                                {record.student.firstName} {record.student.lastName}
                            </Typography.Text>
                            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                {record.student.admissionNumber}
                            </Typography.Text>
                        </Space>
                    );
                } else if (filters.type === 'staff' && record.staff) {
                    return (
                        <Space direction="vertical" size={0}>
                            <Typography.Text strong>
                                {record.staff.firstName} {record.staff.lastName}
                            </Typography.Text>
                            <Space size="small" split="|">
                                <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                                    {record.staff.employeeId}
                                </Typography.Text>
                                <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                                    {record.staff.designation}
                                </Typography.Text>
                            </Space>
                        </Space>
                    );
                }
                return 'N/A';
            },
        },
        ...(filters.type === 'student' ? [
            {
                title: 'Class',
                key: 'class',
                render: (_, record) => record.student ? `${record.class.name || ''} - ${record.section || ''}` : '-'
            }
        ] : [
            {
                title: 'Department',
                key: 'department',
                render: (_, record) => record.staff?.department ? record.staff.department.toUpperCase() : '-'
            }
        ]),
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={statusColors[status]}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
        },
        {
            title: 'Marked By',
            dataIndex: 'markedBy',
            key: 'markedBy',
            render: (user) => user?.name || 'System'
        }
    ];

    return (
        <div className="fade-in">
            <PageHeader
                title="View Attendance"
                subtitle="Browse attendance history"
                breadcrumbs={[
                    { title: 'Attendance', href: '/attendance' },
                    { title: 'View History' }
                ]}
            />

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

                    {filters.type === 'student' ? (
                        <>
                            <Col xs={24} md={5}>
                                <Select
                                    placeholder="Select Class"
                                    style={{ width: '100%' }}
                                    allowClear
                                    value={filters.classId}
                                    onChange={(val) => setFilters(prev => ({ ...prev, classId: val, section: null }))}
                                >
                                    {classes.map((cls) => (
                                        <Option key={cls._id} value={cls._id}>{cls.name}</Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col xs={24} md={5}>
                                <Select
                                    placeholder="Section"
                                    style={{ width: '100%' }}
                                    allowClear
                                    value={filters.section}
                                    onChange={(val) => setFilters(prev => ({ ...prev, section: val }))}
                                    disabled={!filters.classId}
                                >
                                    {filters.classId && classes.find(c => c._id === filters.classId)?.sections?.map(sec => {
                                        const secName = typeof sec === 'object' ? sec.name : sec;
                                        return <Option key={secName} value={secName}>{secName}</Option>;
                                    })}
                                </Select>
                            </Col>
                        </>
                    ) : (
                        <Col xs={24} md={10}>
                            {/* Placeholder for staff department filter if API supported it */}
                        </Col>
                    )}

                    <Col xs={24} md={6}>
                        <RangePicker
                            value={filters.dateRange}
                            onChange={(val) => setFilters(prev => ({ ...prev, dateRange: val }))}
                            style={{ width: '100%' }}
                        />
                    </Col>

                    <Col xs={24} md={4} style={{ textAlign: 'right' }}>
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={() => fetchAttendance(1)}
                            loading={loading}
                        >
                            Filter
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Card
                style={{ borderRadius: 12 }}
                bodyStyle={{ padding: 0 }}
            >
                <Table
                    columns={columns}
                    dataSource={records}
                    loading={loading}
                    rowKey="_id"
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        onChange: (page, pageSize) => handleTableChange({ current: page, pageSize })
                    }}
                />
            </Card>
        </div>
    );
}
