'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  App,
  Card,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Select,
  Typography,
  Table,
  Tabs,
  Empty,
  Avatar,
  Tooltip,
  Badge,
  Spin,
  Modal,
  DatePicker,
  Form,
  Input
} from 'antd';
import {
  PlusOutlined,
  ScheduleOutlined,
  UserOutlined,
  BookOutlined,
  BankOutlined,
  SwapOutlined,
  CalendarOutlined,
  PrinterOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { timetableApi, academicApi, staffApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
// const { confirm } = Modal;

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// Default periods if none found in data
const defaultPeriods = [
  { name: 'Period 1', time: '08:00 - 08:40' },
  { name: 'Period 2', time: '08:45 - 09:25' },
  { name: 'Period 3', time: '09:30 - 10:10' },
  { name: 'Break', time: '10:10 - 10:30', isBreak: true },
  { name: 'Period 4', time: '10:30 - 11:10' },
  { name: 'Period 5', time: '11:15 - 11:55' },
  { name: 'Period 6', time: '12:00 - 12:40' },
  { name: 'Lunch', time: '12:40 - 01:20', isBreak: true },
  { name: 'Period 7', time: '01:20 - 02:00' },
];

const subjectColors = {
  Mathematics: '#1890ff',
  English: '#52c41a',
  Science: '#722ed1',
  Urdu: '#fa8c16',
  'Social Studies': '#13c2c2',
  'Computer': '#eb2f96',
  'Islamic Studies': '#2f54eb',
  'Physical Education': '#faad14',
};

export default function TimetablePage() {
  const { message, modal } = App.useApp();
  const confirm = modal.confirm;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('class');

  // Selection State
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null); // Selected Room

  // Data State
  const [timetableData, setTimetableData] = useState({});
  const [substitutes, setSubstitutes] = useState([]);
  const [rooms, setRooms] = useState([]); // Room state
  const [loading, setLoading] = useState(false);
  const [currentTimetableId, setCurrentTimetableId] = useState(null);

  // Academic Year State
  const [academicYears, setAcademicYears] = useState(['2023-2024', '2024-2025', '2025-2026']);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024-2025');

  // Substitute Modal State
  const [isSubstituteModalOpen, setIsSubstituteModalOpen] = useState(false);
  const [substituteForm] = Form.useForm();
  const [absentTeacherSchedule, setAbsentTeacherSchedule] = useState([]);
  const [availableSubstitutes, setAvailableSubstitutes] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'class' && selectedClass && selectedSection) {
      fetchClassTimetable();
    } else if (activeTab === 'teacher' && selectedTeacher) {
      fetchTeacherTimetable();
    } else if (activeTab === 'substitutes') {
      fetchSubstitutes();
    } else if (activeTab === 'rooms' && selectedRoom) {
      fetchRoomSchedule();
    }
  }, [selectedClass, selectedSection, selectedTeacher, selectedRoom, activeTab, selectedAcademicYear]);

  const fetchInitialData = async () => {
    try {
      const [classesRes, teachersRes, roomsRes, currentYearRes] = await Promise.all([
        academicApi.getClasses({ limit: 100 }),
        staffApi.getAll({ role: 'teacher', limit: 100 }),
        academicApi.getRooms({ limit: 100 }),
        academicApi.getCurrentAcademicYear() // Fetch current year to set default
      ]);

      if (classesRes?.success) {
        setClasses(classesRes.data.docs || classesRes.data);
      }
      if (teachersRes?.success) {
        setTeachers(teachersRes.data.docs || teachersRes.data);
      }
      if (roomsRes?.success) {
        setRooms(roomsRes?.data);
      }
      if (currentYearRes?.success) {
        // If API returns a single current year, ensure it's in our list and selected
        const current = currentYearRes.data.name || currentYearRes.data; // Adjust based on API response
        if (current && !academicYears.includes(current)) {
          setAcademicYears(prev => [...prev, current].sort());
        }
        setSelectedAcademicYear(current || '2024-2025');
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to load initial data');
    }
  };

  const fetchClassTimetable = async () => {
    setLoading(true);
    setTimetableData({});
    setCurrentTimetableId(null);
    try {
      const res = await timetableApi.getAll({
        class: selectedClass,
        section: selectedSection,
        status: 'active', // Use status instead of isActive
        academicYear: selectedAcademicYear
      });

      if (res?.success && res.data?.length > 0) {
        const doc = res.data[0];
        setCurrentTimetableId(doc._id);
        const transformed = transformTimetable(doc.schedule);
        setTimetableData(transformed);
      } else {
        setTimetableData({});
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch class timetable');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherTimetable = async () => {
    setLoading(true);
    setTimetableData({});
    try {
      const res = await timetableApi.getTeacherTimetable(selectedTeacher, { academicYear: selectedAcademicYear });
      if (res?.success) {
        const transformed = transformTeacherSchedule(res?.data?.schedule);
        console.log("transformed", transformed)
        setTimetableData(transformed);
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch teacher timetable');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubstitutes = async () => {
    console.log("umair")
    setLoading(true);
    try {
      const res = await timetableApi.getSubstitutes();
      console.log(res, "res")
      if (res?.success) {
        setSubstitutes(res.data);
      }
    } catch (error) {
      message.error('Failed to fetch substitutes');
    } finally {
      setLoading(false);
    }
  };

  const onSubstituteModalOpen = () => {
    substituteForm.resetFields();
    setAbsentTeacherSchedule([]);
    setAvailableSubstitutes([]);
    setSelectedSlot(null);
    setIsSubstituteModalOpen(true);
  };

  const onSubstituteFormValuesChange = async (changedValues, allValues) => {
    if (changedValues.originalTeacher || changedValues.date) {
      const { originalTeacher, date } = allValues;

      if (originalTeacher && date) {
        try {
          const day = dayjs(date).format('dddd');
          const res = await timetableApi.getTeacherTimetable(originalTeacher);
          if (res?.success) {
            const schedules = res?.data?.schedule?.filter(s => s.day === day && !s.isSubstitute);
            setAbsentTeacherSchedule(schedules || []);
            substituteForm.setFieldValue('slot', null);
          }
        } catch (error) {
          console.error('Error fetching teacher timetable:', error.message || error);
        }
      }
    }
  };

  const handleSlotChange = async (value) => {
    // value is index in absentTeacherSchedule
    const slot = absentTeacherSchedule[value];
    setSelectedSlot(slot);

    if (slot) {
      try {
        const date = substituteForm.getFieldValue('date');
        const res = await timetableApi.getAvailableSubstitutes({
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          branch: slot.branch // if available, or rely on user context
        });
        console.log(res, "res")
        if (res?.success) {
          setAvailableSubstitutes(res?.data);
        }
      } catch (error) {
        message.error('Failed to fetch available substitutes');
      }
    }
  };

  const handleAssignSubstitute = async () => {
    try {
      const values = await substituteForm.validateFields();
      const slot = absentTeacherSchedule[values.slot];

      if (!slot || !slot.timetableId) {
        message.error('Invalid slot selected (missing timetable ID)');
        return;
      }

      await timetableApi.assignSubstitute(slot.timetableId, {
        dayIndex: days.indexOf(slot.day), // Assumption
        periodIndex: slot.periodIndex,
        substituteTeacherId: values.substituteTeacher,
        reason: values.reason,
        date: values.date.format('YYYY-MM-DD')
      });

      message.success('Substitute assigned successfully');
      setIsSubstituteModalOpen(false);
      fetchSubstitutes();
    } catch (error) {
      console.error(error);
      message.error('Failed to assign substitute');
    }
  };

  const handleRemoveSubstitute = async (record) => {
    confirm({
      title: 'Remove Substitute?',
      content: 'This will revert to the original teacher.',
      onOk: async () => {
        try {
          await timetableApi.removeSubstitute(record.timetableId, {
            dayIndex: days.indexOf(record.day), // Assumption
            periodIndex: record.periodIndex
          });
          message.success('Substitute removed');
          fetchSubstitutes();
        } catch (error) {
          message.error('Failed to remove substitute');
        }
      }
    });
  };

  const fetchRoomSchedule = async () => {
    setLoading(true);
    setTimetableData({});
    try {
      const res = await timetableApi.getRoomSchedule(selectedRoom, { academicYear: selectedAcademicYear });
      if (res?.success) {
        const transformed = transformRoomSchedule(res.data.schedule);
        setTimetableData(transformed);
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch room schedule');
    } finally {
      setLoading(false);
    }
  };

  const transformRoomSchedule = (scheduleList) => {
    const map = {};
    if (!scheduleList) return map;

    scheduleList.forEach(item => {
      if (!map[item.day]) map[item.day] = {};
      const periodDef = defaultPeriods.find(p => !p.isBreak && p.time.startsWith(item.startTime));
      const pName = periodDef ? periodDef.name : `Period (${item.startTime})`;

      map[item.day][pName] = {
        subject: item.subject?.name || item.subject || 'Subject',
        teacher: `${item.class} ${item.section} (${item.teacher?.name || 'Teacher'})`,
        room: item.room?.name || 'This Room',
        startTime: item.startTime,
        endTime: item.endTime
      };
    });
    return map;
  };

  const RoomsTimetable = () => (
    <>
      <Card style={{ marginBottom: 24, borderRadius: 12 }} variant="borderless">
        <Space size="large">
          <div>
            <Text strong style={{ marginRight: 8 }}>Room:</Text>
            <Select
              showSearch
              placeholder="Select Room"
              value={selectedRoom}
              onChange={setSelectedRoom}
              style={{ width: 250 }}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={rooms.map(r => ({ label: r.name, value: r._id }))}
            />
          </div>
        </Space>
      </Card>

      {selectedRoom ? (
        <Card
          variant="borderless"
          title={
            <Space>
              <BankOutlined className="text-primary" />
              <span>Room Schedule</span>
            </Space>
          }
          style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
          <Table
            columns={timetableColumns}
            dataSource={defaultPeriods}
            loading={loading}
            pagination={false}
            rowKey="name"
            scroll={{ x: 1200 }}
            size="middle"
            bordered
          />
        </Card>
      ) : (
        <Card variant="borderless" style={{ borderRadius: 12 }}>
          <Empty description="Select a room to view schedule" />
        </Card>
      )}
    </>
  );

  const substituteColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (d) => dayjs(d).format('DD MMM YYYY')
    },
    { title: 'Class', dataIndex: 'class', key: 'class', render: (t, r) => `${t} - ${r.section}` },
    { title: 'Period', dataIndex: 'periodNumber', key: 'period' },
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
    {
      title: 'Original Teacher',
      dataIndex: 'originalTeacher',
      key: 'original',
      render: (t) => t?.firstName + " " + t?.lastName || 'Unknown'
    },
    {
      title: 'Substitute',
      dataIndex: 'substituteTeacher',
      key: 'substitute',
      render: (t) => <Tag color="orange">{t?.firstName + " " + t?.lastName || t?.fullName || 'Unknown'}</Tag>
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link" danger onClick={() => handleRemoveSubstitute(record)}>
          Remove
        </Button>
      )
    }
  ];

  const transformTimetable = (schedule) => {
    const map = {};
    if (!schedule) return map;

    schedule.forEach(daySch => {
      map[daySch.day] = {};
      daySch.periods.forEach(p => {
        const pName = `Period ${p.periodNumber}`;
        map[daySch.day][pName] = {
          subject: p.subjectName || 'Unknown',
          teacher: p.teacher?.firstName || 'Unknown',
          room: p.roomName || 'Unknown',
          startTime: p.startTime,
          endTime: p.endTime
        };
      });
    });
    return map;
  };

  const transformTeacherSchedule = (scheduleList) => {
    const map = {};
    if (!scheduleList) return map;

    // Get only teaching periods from defaultPeriods to map by index if time match fails
    const teachingPeriods = defaultPeriods.filter(p => !p.isBreak);

    scheduleList.forEach(item => {
      if (!map[item.day]) map[item.day] = {};

      // 1. Try exact start time match
      let periodDef = defaultPeriods.find(p => !p.isBreak && p.time.startsWith(item.startTime));

      // 2. Fallback: Use period index if available (mapping 0 -> 1st teaching period)
      if (!periodDef && typeof item.periodIndex === 'number' && teachingPeriods[item.periodIndex]) {
        periodDef = teachingPeriods[item.periodIndex];
      }

      const pName = periodDef ? periodDef.name : `Period (${item.startTime})`;
      const className = item.class?.name || item.class || 'Class';
      const sectionName = item.section || '';

      map[item.day][pName] = {
        subject: item.subject?.name || item.subject || 'Subject',
        teacher: `${className} - ${sectionName}`,
        room: item.room?.name || item.room || '',
        startTime: item.startTime,
        endTime: item.endTime
      };
    });
    return map;
  };

  const handleDelete = () => {
    if (!currentTimetableId) return;
    confirm({
      title: 'Are you sure delete this timetable?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await timetableApi.delete(currentTimetableId);
          message.success('Timetable deleted');
          fetchClassTimetable();
        } catch (error) {
          message.error('Failed to delete timetable');
        }
      },
    });
  };

  const renderTimetableCell = (day, period) => {
    if (period.isBreak) {
      return (
        <div style={{ textAlign: 'center', padding: 8, background: '#fafafa', borderRadius: 6, height: '100%' }}>
          <Text type="secondary" style={{ fontSize: 11 }}>{period.name}</Text>
        </div>
      );
    }

    const slot = timetableData[day]?.[period.name];

    if (!slot) {
      return (
        <div style={{ textAlign: 'center', padding: 8, background: '#f5f5f5', borderRadius: 6, height: 80 }}>
          <Text type="secondary">-</Text>
        </div>
      );
    }

    return (
      <Tooltip title={`${slot.teacher} • ${slot.room} (${slot.startTime}-${slot.endTime})`}>
        <div
          style={{
            padding: 8,
            borderRadius: 6,
            background: `${subjectColors[slot.subject] || '#1890ff'}15`,
            borderLeft: `3px solid ${subjectColors[slot.subject] || '#1890ff'}`,
            cursor: 'pointer',
            height: 80,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Text strong style={{ color: subjectColors[slot.subject], fontSize: 13, display: 'block', marginBottom: 4 }}>
            {slot.subject}
          </Text>
          <div style={{ fontSize: 12, color: '#595959' }}>
            {slot.teacher}
          </div>
          {slot.room && (
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              {slot.room}
            </div>
          )}
        </div>
      </Tooltip>
    );
  };

  const timetableColumns = [
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      width: 100,
      fixed: 'left',
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <Text strong style={{ fontSize: 12, display: 'block' }}>{record.name}</Text>
          <div style={{ fontSize: 10, color: '#8c8c8c' }}>{record.time}</div>
        </div>
      ),
    },
    ...days.map((day) => ({
      title: day,
      dataIndex: day,
      key: day,
      width: 150,
      render: (_, record) => renderTimetableCell(day, record),
    })),
  ];

  const ClassTimetable = () => (
    <>
      <Card style={{ marginBottom: 24, borderRadius: 12 }} variant="borderless">
        <Space size="middle" wrap>
          <div>
            <Text strong style={{ marginRight: 8 }}>Class:</Text>
            <Select
              placeholder="Select Class"
              value={selectedClass}
              onChange={(val) => {
                setSelectedClass(val);
                setSelectedSection(null);
                setTimetableData({});
              }}
              style={{ width: 150 }}
              options={classes.map(c => ({ label: c.name, value: c._id }))}
            />
          </div>
          <div>
            <Text strong style={{ marginRight: 8 }}>Section:</Text>
            <Select
              placeholder="Section"
              value={selectedSection}
              onChange={setSelectedSection}
              style={{ width: 100 }}
              disabled={!selectedClass}
              options={
                selectedClass
                  ? classes.find(c => c._id === selectedClass)?.sections.map(s => ({ label: s.name, value: s.name }))
                  : []
              }
            />
          </div>
          <Space>
            {currentTimetableId && (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => router.push(`/timetable/builder?id=${currentTimetableId}`)}
                >
                  Edit
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </>
            )}
            <Button icon={<PrinterOutlined />}>Print</Button>
          </Space>
        </Space>
      </Card>

      <Card
        variant="borderless"
        title={
          <Space>
            <ScheduleOutlined className="text-primary" />
            <span>Timetable View</span>
          </Space>
        }
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        {selectedClass && selectedSection ? (
          <Table
            columns={timetableColumns}
            dataSource={defaultPeriods}
            loading={loading}
            pagination={false}
            rowKey="name"
            scroll={{ x: 1200 }}
            size="middle"
            bordered
          />
        ) : (
          <Empty description="Please select Class and Section" />
        )}
      </Card>
    </>
  );

  const TeacherTimetable = () => (
    <>
      <Card style={{ marginBottom: 24, borderRadius: 12 }} variant="borderless">
        <Space size="large">
          <div>
            <Text strong style={{ marginRight: 8 }}>Teacher:</Text>
            <Select
              showSearch
              placeholder="Select Teacher"
              value={selectedTeacher}
              onChange={setSelectedTeacher}
              style={{ width: 250 }}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={teachers.map(t => ({ label: t.fullName, value: t._id }))}
            />
          </div>
          {selectedTeacher && (
            <Button icon={<PrinterOutlined />}>Print</Button>
          )}
        </Space>
      </Card>

      {selectedTeacher ? (
        <Card
          variant="borderless"
          title={
            <Space>
              <UserOutlined className="text-primary" />
              <span>Teacher Schedule</span>
            </Space>
          }
          style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
          <Table
            columns={timetableColumns}
            dataSource={defaultPeriods}
            loading={loading}
            pagination={false}
            rowKey="name"
            scroll={{ x: 1200 }}
            size="middle"
            bordered
          />
        </Card>
      ) : (
        <Card variant="borderless" style={{ borderRadius: 12 }}>
          <Empty description="Select a teacher to view timetable" />
        </Card>
      )}
    </>
  );

  const Substitutes = () => (
    <Card
      title="Substitute Teachers"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={onSubstituteModalOpen}>
          Assign Substitute
        </Button>
      }
      variant="borderless"
      style={{ borderRadius: 12 }}
    >
      <Table
        columns={substituteColumns}
        dataSource={substitutes}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Assign Substitute Teacher"
        open={isSubstituteModalOpen}
        onOk={handleAssignSubstitute}
        onCancel={() => setIsSubstituteModalOpen(false)}
        confirmLoading={loading}
        width={600}
      >
        <Form form={substituteForm} layout="vertical" onValuesChange={onSubstituteFormValuesChange}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="originalTeacher" label="Absent Teacher" rules={[{ required: true }]}>
                <Select
                  placeholder="Select Teacher"
                  options={teachers.map(t => ({ label: t.fullName, value: t._id }))}
                  showSearch
                  filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="slot" label="Select Period/Class" rules={[{ required: true }]}>
            <Select
              placeholder="Select the class to substitute"
              onChange={handleSlotChange}
              disabled={!absentTeacherSchedule.length}
            >
              {absentTeacherSchedule.map((slot, idx) => (
                <Option key={idx} value={idx}>
                  {slot.startTime} - {slot.class?.name || slot.class} {slot.section} ({slot.subject?.name || slot.subject})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="substituteTeacher" label="Substitute Teacher" rules={[{ required: true }]}>
            <Select
              placeholder="Select Available Teacher"
              disabled={!availableSubstitutes.length}
              showSearch
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            >
              {availableSubstitutes.map(t => (
                <Option key={t._id} value={t._id}>{t.firstName + ' ' + t.lastName} ({t.department || 'General'})</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="reason" label="Reason">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );

  const tabItems = [
    {
      key: 'class',
      label: <><ScheduleOutlined /> Class Timetable</>,
      children: <ClassTimetable />,
    },
    {
      key: 'teacher',
      label: <><UserOutlined /> Teacher Timetable</>,
      children: <TeacherTimetable />,
    },
    // {
    //   key: 'rooms',
    //   label: <><BankOutlined /> Room Availability</>,
    //   children: <RoomsTimetable />,
    // },
    {
      key: 'substitutes',
      label: <span><SwapOutlined /> Substitutes</span>,
      children: <Substitutes />,
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Timetable Management"
        subtitle="View and manage class and teacher timetables"
        breadcrumbs={[{ title: 'Timetable' }]}
        actions={
          <Space>
            <Select
              key="academicYear"
              value={selectedAcademicYear}
              onChange={setSelectedAcademicYear}
              style={{ width: 120 }}
              options={academicYears.map(y => ({ label: y, value: y }))}
            />
            {/* <Button icon={<CalendarOutlined />} onClick={() => router.push('/timetable/holidays')}>
              Holidays
            </Button> */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/timetable/builder')}
            >
              Create Timetable
            </Button>
          </Space>
        }
      />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        type="card"
        className="timetable-tabs"
      />
    </div>
  );
}
