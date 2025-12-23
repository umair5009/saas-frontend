'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Radio,
  message,
  Typography,
  Statistic,
  Tabs,
  Input,
  Spin
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  SaveOutlined,
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import dayjs from 'dayjs';
import { attendanceApi } from '@/lib/api/attendance';
import { academicApi } from '@/lib/api/academic';
import { studentApi } from '@/lib/api/students';
import { staffApi } from '@/lib/api/staff';

const { Title, Text } = Typography;
const { Option } = Select;

const statusColors = {
  present: '#52c41a',
  absent: '#ff4d4f',
  late: '#faad14',
  leave: '#1890ff',
};

const DEPARTMENTS = [
  'academic', 'administration', 'accounts', 'library', 'transport',
  'sports', 'it', 'maintenance', 'security', 'other'
];

export default function AttendancePage() {
  // Global State
  const [activeTab, setActiveTab] = useState('student');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  // Student State
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents] = useState([]);

  // Staff State
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [staffList, setStaffList] = useState([]);

  // Attendance Data
  const [attendance, setAttendance] = useState({});
  const [remarks, setRemarks] = useState({});
  const [summary, setSummary] = useState({ present: 0, absent: 0, late: 0, leave: 0 });

  // Get selected class name using useMemo
  const selectedClassName = useMemo(() => {
    if (!selectedClass) return '';
    const foundClass = classes.find(cls => cls._id === selectedClass);
    return foundClass ? foundClass.name : '';
  }, [selectedClass, classes]);

  // Fetch classes on mount
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await academicApi.getClasses();
      if (res.success) {
        setClasses(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      message.error('Failed to load classes');
    }
  };

  // Fetch entities when filters change
  const fetchEntities = useCallback(async () => {
    // Reset state immediately when filters could imply a change
    // But we need to keep loading state separate
    setAttendance({});
    setRemarks({});
    setSummary({ present: 0, absent: 0, late: 0, leave: 0 });
    setIsUpdateMode(false);

    if (activeTab === 'student' && (!selectedClass || !selectedSection)) {
      setStudents([]);
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'student') {
        console.log('=== FETCHING STUDENT ATTENDANCE ===');
        console.log('Selected Class:', selectedClass);
        console.log('Selected Section:', selectedSection);
        console.log('Date:', selectedDate.format('YYYY-MM-DD'));

        // Fetch class attendance
        const res = await attendanceApi.getClassAttendance({
          className: selectedClass,
          section: selectedSection,
          date: selectedDate.format('YYYY-MM-DD')
        });

        console.log('API Response:', res);

        if (res?.success) {
          const { marked = [], unmarked = [] } = res.data;
          console.log('Marked students:', marked.length);
          console.log('Unmarked students:', unmarked.length);
          console.log('Unmarked student list:', unmarked);

          // Determine update mode based on if we have any marked records
          const hasMarkedRecords = marked.length > 0;
          setIsUpdateMode(hasMarkedRecords);

          // Combine marked and unmarked students
          const markedStudents = marked.map(record => ({
            ...record.student,
            attendanceId: record._id,
            status: record.status,
            remarks: record.remarks || '',
            isMarked: true
          }));

          const unmarkedStudents = unmarked.map(student => ({
            ...student,
            status: null, // Default to neutral
            remarks: '',
            isMarked: false
          }));

          const allStudents = [...markedStudents, ...unmarkedStudents].sort((a, b) =>
            (a.rollNumber || '').localeCompare(b.rollNumber || '')
          );
          console.log('=== TOTAL STUDENTS ===');
          console.log('Total students to display:', allStudents.length);
          console.log('Students:', allStudents);
          // Build attendance maps
          const attMap = {};
          const remarkMap = {};
          allStudents.forEach(s => {
            if (s.status) attMap[s._id] = s.status; // Only set if status exists
            if (s.remarks) remarkMap[s._id] = s.remarks;
          });

          setStudents(allStudents);
          setAttendance(attMap);
          setRemarks(remarkMap);
          updateSummary(attMap);
        }
      } else {
        // Fetch staff
        const [staffRes, attRes] = await Promise.all([
          staffApi.getAll({
            status: 'active',
            department: selectedDepartment === 'all' ? undefined : selectedDepartment,
            limit: 1000
          }),
          attendanceApi.getAll({
            type: 'staff',
            date: selectedDate.format('YYYY-MM-DD'),
            limit: 1000
          })
        ]);

        if (staffRes.success) {
          // Staff list is in res.data (array)
          const allStaff = Array.isArray(staffRes.data) ? staffRes.data : [];
          const markedRecords = (attRes.success && Array.isArray(attRes.data)) ? attRes.data : [];

          const hasMarkedRecords = markedRecords.length > 0;
          setIsUpdateMode(hasMarkedRecords);

          // Create attendance map
          const markedMap = new Map();
          markedRecords.forEach(record => {
            const staffId = typeof record.staff === 'object' ? record.staff._id : record.staff;
            markedMap.set(staffId, record);
          });

          // Merge staff with attendance
          const staffWithAttendance = allStaff.map(s => {
            const record = markedMap.get(s._id);
            return {
              ...s,
              attendanceId: record?._id,
              status: record?.status || null,
              remarks: record?.remarks || '',
              isMarked: !!record
            };
          });

          const attMap = {};
          const remarkMap = {};
          staffWithAttendance.forEach(s => {
            if (s.status) attMap[s._id] = s.status;
            if (s.remarks) remarkMap[s._id] = s.remarks;
          });

          setStaffList(staffWithAttendance);
          setAttendance(attMap);
          setRemarks(remarkMap);
          updateSummary(attMap);
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedClass, selectedSection, selectedDepartment, selectedDate]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  const updateSummary = (att) => {
    const counts = { present: 0, absent: 0, late: 0, leave: 0 };
    Object.values(att).forEach((status) => {
      if (counts[status] !== undefined) counts[status]++;
    });
    setSummary(counts);
  };

  const handleAttendanceChange = (id, status) => {
    const newAttendance = { ...attendance, [id]: status };
    setAttendance(newAttendance);
    updateSummary(newAttendance);
  };

  const handleRemarkChange = (id, value) => {
    setRemarks(prev => ({ ...prev, [id]: value }));
  };

  const markAll = (status) => {
    const list = activeTab === 'student' ? students : staffList;
    const newAttendance = {};
    list.forEach(item => {
      newAttendance[item._id] = status;
    });
    setAttendance(newAttendance);
    updateSummary(newAttendance);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const list = activeTab === 'student' ? students : staffList;

      if (list.length === 0) {
        message.warning('No records to save');
        return;
      }

      const attendanceList = list
        .filter(item => attendance[item._id]) // Only save records with a status
        .map(item => ({
          [activeTab === 'student' ? 'studentId' : 'staffId']: item._id,
          status: attendance[item._id],
          remarks: remarks[item._id] || ''
        }));

      if (attendanceList.length === 0) {
        message.warning('Please mark attendance for at least one record');
        return;
      }

      const payload = {
        type: activeTab,
        date: selectedDate.format('YYYY-MM-DD'),
        attendanceList,
        ...(activeTab === 'student' && {
          className: selectedClass,
          section: selectedSection
        })
      };

      const res = await attendanceApi.bulkMark(payload);

      if (res.success) {
        message.success(`Successfully saved attendance for ${res.data?.success || list.length} records`);
        fetchEntities(); // Refresh
      }
    } catch (error) {
      console.error('Save error:', error);
      message.error(error.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const currentList = activeTab === 'student' ? students : staffList;

  const columns = [
    {
      title: activeTab === 'student' ? 'Roll No' : 'Emp ID',
      dataIndex: activeTab === 'student' ? 'rollNumber' : 'employeeId',
      key: 'id',
      width: 100,
    },
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: record.gender === 'male' ? '#e6f7ff' : '#fff0f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserOutlined style={{ color: record.gender === 'male' ? '#1890ff' : '#eb2f96' }} />
          </div>
          <Space direction="vertical" size={0}>
            <Text strong>{record.firstName} {record.lastName}</Text>
            {activeTab === 'staff' && record.designation && (
              <Text type="secondary" style={{ fontSize: 11 }}>{record.designation}</Text>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 420,
      render: (_, record) => (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Radio.Group
            value={attendance[record._id]}
            onChange={(e) => handleAttendanceChange(record._id, e.target.value)}
            buttonStyle="solid"
            size="small"
          >
            <Radio.Button value="present">
              <CheckOutlined /> Present
            </Radio.Button>
            <Radio.Button value="absent">
              <CloseOutlined /> Absent
            </Radio.Button>
            <Radio.Button value="late">
              <ClockCircleOutlined /> Late
            </Radio.Button>
            <Radio.Button value="leave">
              Leave
            </Radio.Button>
          </Radio.Group>
          <Input
            placeholder="Remarks (optional)"
            size="small"
            style={{ width: '100%', marginTop: 4 }}
            value={remarks[record._id] || ''}
            onChange={(e) => handleRemarkChange(record._id, e.target.value)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Attendance Management"
        subtitle="Mark and manage daily attendance"
        breadcrumbs={[{ title: 'Attendance' }]}
      />

      <Card style={{ marginBottom: 24, borderRadius: 12 }}>


        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'student',
              label: (
                <span>
                  <UserOutlined />
                  Student Attendance
                </span>
              ),
              children: (
                <Row gutter={16} align="middle">
                  <Col xs={24} sm={8} md={6}>
                    <Select
                      placeholder="Select Class"
                      style={{ width: '100%' }}
                      onChange={(val) => {
                        console.log(val);
                        setSelectedClass(val);
                        setSelectedSection(null);
                      }}
                      value={selectedClass}
                    >
                      {classes.map((cls) => (
                        <Option key={cls._id} value={cls._id}>{cls.name}</Option>
                      ))}
                    </Select>
                  </Col>

                  <Col xs={24} sm={8} md={6}>
                    <Select
                      placeholder="Select Section"
                      style={{ width: '100%' }}
                      onChange={setSelectedSection}
                      value={selectedSection}
                      disabled={!selectedClass}
                    >
                      {selectedClass && classes.find(c => c._id === selectedClass)?.sections?.map(sec => {
                        const secName = typeof sec === 'object' ? sec.name : sec;
                        return <Option key={secName} value={secName}>{secName}</Option>;
                      })}
                    </Select>
                  </Col>

                  <Col xs={24} sm={8} md={6}>
                    <DatePicker
                      value={selectedDate}
                      onChange={setSelectedDate}
                      allowClear={false}
                      format="YYYY-MM-DD"
                      disabledDate={(current) => current && current > dayjs().endOf('day')}
                      style={{ width: '100%' }}
                      placeholder="Select Date"
                    />
                  </Col>

                  <Col flex="auto" style={{ textAlign: 'right' }}>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={fetchEntities}
                      loading={loading}
                    >
                      Refresh
                    </Button>
                  </Col>
                </Row>
              )
            },
            {
              key: 'staff',
              label: (
                <span>
                  <UserOutlined />
                  Staff Attendance
                </span>
              ),
              children: (
                <Row gutter={16} align="middle">
                  <Col xs={24} sm={8} md={8}>
                    <Select
                      placeholder="Filter by Department"
                      style={{ width: '100%' }}
                      onChange={setSelectedDepartment}
                      value={selectedDepartment}
                    >
                      <Option value="all">All Departments</Option>
                      {DEPARTMENTS.map(dept => (
                        <Option key={dept} value={dept}>
                          {dept.charAt(0).toUpperCase() + dept.slice(1)}
                        </Option>
                      ))}
                    </Select>
                  </Col>

                  <Col xs={24} sm={8} md={8}>
                    <DatePicker
                      value={selectedDate}
                      onChange={setSelectedDate}
                      allowClear={false}
                      format="YYYY-MM-DD"
                      disabledDate={(current) => current && current > dayjs().endOf('day')}
                      style={{ width: '100%' }}
                      placeholder="Select Date"
                    />
                  </Col>
                  <Col flex="auto" style={{ textAlign: 'right' }}>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={fetchEntities}
                      loading={loading}
                    >
                      Refresh
                    </Button>
                  </Col>
                </Row>
              )
            }
          ]}
        />
      </Card>

      {currentList.length > 0 ? (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {Object.keys(summary).map(key => (
              <Col xs={12} sm={6} md={6} key={key}>
                <Card
                  size="small"
                  style={{
                    borderRadius: 8,
                    borderTop: `3px solid ${statusColors[key]}`,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  <Statistic
                    title={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={summary[key]}
                    valueStyle={{ color: statusColors[key], fontSize: 18 }}
                    suffix={<span style={{ fontSize: 12, color: '#999' }}>/ {currentList.length}</span>}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <Card
            title={
              <Space>
                <Text strong>
                  {activeTab === 'student' ? `${selectedClassName} - ${selectedSection}` : 'Staff List'}
                </Text>
                <Tag>{currentList.length} Records</Tag>
              </Space>
            }
            extra={
              <Space>
                <Button onClick={() => markAll('present')} size="small">Mark All Present</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={saving}
                >
                  {isUpdateMode ? 'Update Attendance' : 'Save Attendance'}
                </Button>
              </Space>
            }
            style={{ borderRadius: 12 }}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              columns={columns}
              dataSource={currentList}
              loading={loading}
              pagination={false}
              rowKey="_id"
              scroll={{ y: 600 }}
              size="middle"
            />
          </Card>
        </>
      ) : (
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: 48 }}>
          {loading ? (
            <Spin size="large" tip="Loading data..." />
          ) : (
            <>
              <SearchOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
              <Title level={4} type="secondary">No Data To Display</Title>
              <Text type="secondary">
                {activeTab === 'student'
                  ? 'Please select a Class and Section to view students'
                  : 'No staff members found matching the criteria'
                }
              </Text>
            </>
          )}
        </Card>
      )}
    </div>
  );
}