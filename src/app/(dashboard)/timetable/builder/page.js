'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Form,
  Input,
  Select,
  TimePicker,
  message,
  Typography,
  Alert,
  Spin,
  Tooltip
} from 'antd';
import {
  SaveOutlined,
  CalendarOutlined,
  WarningOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { timetableApi, academicApi, staffApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const days = ['Monday', 'Tuesday'];
const defaultPeriods = Array.from({ length: 1 }, (_, i) => i + 1);

function TimetableBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timetableId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [conflicts, setConflicts] = useState([]);

  // Data Lists
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [currentAcademicYear, setCurrentAcademicYear] = useState(null);

  // Form State
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [timetable, setTimetable] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (timetableId) {
      loadTimetable(timetableId);
    }
  }, [timetableId]);

  const fetchInitialData = async () => {
    setDataLoading(true);
    try {
      const [classesRes, teachersRes, subjectsRes, yearRes] = await Promise.all([
        academicApi.getClasses({ limit: 100 }),
        staffApi.getAll({ role: 'teacher', limit: 100 }),
        academicApi.getSubjects({ limit: 100 }),
        academicApi.getCurrentAcademicYear()
      ]);

      if (classesRes?.success) setClasses(classesRes.data.docs || classesRes.data);
      if (teachersRes?.success) setTeachers(teachersRes.data.docs || teachersRes.data);
      if (subjectsRes?.success) setSubjects(subjectsRes.data.docs || subjectsRes.data);
      if (yearRes?.success) setCurrentAcademicYear(yearRes.data.name || yearRes.data);
    } catch (error) {
      message.error('Failed to load initial data');
    } finally {
      setDataLoading(false);
    }
  };

  const loadTimetable = async (id) => {
    setLoading(true);
    try {
      const data = await timetableApi.getById(id);
      if (data.success) {
        const tt = data.data;
        setSelectedClass(tt.class);
        setSelectedSection(tt.section);

        // Transform schedule array to map
        const map = {};
        tt.schedule.forEach(daySch => {
          map[daySch.day] = {};
          daySch.periods.forEach(p => {
            map[daySch.day][p.periodNumber] = {
              subject: p.subjectName || '', // ideally we store IDs too
              subjectId: p.subject, // store ID for saving
              teacher: p.teacher?._id || p.teacher, // store ID
              room: p.roomName || '', // just string for now unless room ID
              startTime: p.startTime,
              endTime: p.endTime
            };
          });
        });
        setTimetable(map);
      }
    } catch (error) {
      message.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTime = (period, type) => {
    // Start at 8:00 AM
    const startBase = dayjs().hour(8).minute(0).second(0);
    // 40 min periods, 10 min break after period 3 (just a guess/example logic)
    // You might want to remove hardcoded breaks if "dynamic" means completely freeform
    // But defaults help UX.
    let minutesToAdd = (period - 1) * 40;
    if (period > 3) minutesToAdd += 20; // 20 min break
    if (period > 6) minutesToAdd += 40; // 40 min lunch

    const startTime = startBase.add(minutesToAdd, 'minute');
    const endTime = startTime.add(40, 'minute');

    return type === 'start' ? startTime.format('HH:mm') : endTime.format('HH:mm');
  };

  const updatePeriod = (day, period, field, value) => {
    setTimetable(prev => {
      const updated = { ...prev };
      if (!updated[day]) updated[day] = {};

      // Initialize with defaults if creating new slot
      if (!updated[day][period]) {
        updated[day][period] = {
          subject: '',
          teacher: '',
          room: '',
          startTime: getDefaultTime(period, 'start'),
          endTime: getDefaultTime(period, 'end'),
        };
      }

      // Handle special fields
      if (field === 'subject') {
        // value is ID, find name
        const subj = subjects.find(s => s._id === value);
        updated[day][period].subjectId = value;
        updated[day][period].subject = subj ? subj.name : '';
      } else {
        updated[day][period][field] = value;
      }

      return updated;
    });
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedSection) {
      message.warning('Please select class and section first');
      return;
    }

    setLoading(true);
    try {
      // Transform map back to array
      const schedule = Object.entries(timetable).map(([day, periods]) => ({
        day,
        periods: Object.entries(periods).map(([pNum, pData]) => ({
          periodNumber: parseInt(pNum),
          startTime: pData.startTime || '00:00',
          endTime: pData.endTime || '00:00',
          subject: pData.subjectId, // if we tracked IDs
          subjectName: pData.subject,
          teacher: pData.teacher,
          roomName: pData.room,
          type: 'regular'
        })).filter(p => p.subjectName || p.teacher) // Filter empty slots
      })).filter(day => day.periods.length > 0);

      const payload = {
        class: selectedClass,
        section: selectedSection,
        academicYear: currentAcademicYear || '2024-2025',
        schedule,
        isActive: true,
        effectiveFrom: new Date(), // Required field
        // branch will be handled by backend or added if available in context
      };

      if (timetableId) {
        await timetableApi.update(timetableId, payload);
        message.success('Timetable updated successfully!');
      } else {
        await timetableApi.create(payload);
        message.success('Timetable created successfully!');
      }
      router.push('/timetable');
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || 'Failed to save timetable');
      if (error.response?.data?.conflicts) {
        setConflicts(error.response.data.conflicts);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderTimetableCell = (day, period) => {
    const periodData = timetable[day]?.[period] || {};

    return (
      <Card
        size="small"
        style={{
          marginBottom: 8,
          minWidth: 200,
          background: '#fafafa'
        }}
        bodyStyle={{ padding: 8 }}
      >
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Select
            showSearch
            placeholder="Subject"
            size="small"
            style={{ width: '100%' }}
            value={periodData.subjectId || undefined} // Use ID if available
            onChange={(val) => updatePeriod(day, period, 'subject', val)}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={subjects.map(s => ({ label: s.name, value: s._id }))}
          />
          <Select
            showSearch
            placeholder="Teacher"
            size="small"
            style={{ width: '100%' }}
            value={periodData.teacher || undefined}
            onChange={(val) => updatePeriod(day, period, 'teacher', val)}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={teachers.map(t => ({ label: t.fullName, value: t._id }))}
          />
          <Input
            size="small"
            placeholder="Room"
            value={periodData.room}
            onChange={(e) => updatePeriod(day, period, 'room', e.target.value)}
          />
          <Space size={4}>
            <TimePicker
              size="small"
              placeholder="Start"
              format="HH:mm"
              style={{ width: 85 }}
              value={periodData.startTime ? dayjs(periodData.startTime, 'HH:mm') : null}
              onChange={(time) => updatePeriod(day, period, 'startTime', time?.format('HH:mm'))}
            />
            <TimePicker
              size="small"
              placeholder="End"
              format="HH:mm"
              style={{ width: 85 }}
              value={periodData.endTime ? dayjs(periodData.endTime, 'HH:mm') : null}
              onChange={(time) => updatePeriod(day, period, 'endTime', time?.format('HH:mm'))}
            />
          </Space>
        </Space>
      </Card>
    );
  };

  if (dataLoading) {
    return <div className="p-8 text-center"><Spin size="large" /></div>;
  }

  return (
    <div className="fade-in">
      <PageHeader
        title={timetableId ? "Edit Timetable" : "Create Timetable"}
        subtitle="Configure class schedule"
        breadcrumbs={[
          { title: 'Timetable', path: '/timetable' },
          { title: timetableId ? 'Edit' : 'Create' },
        ]}
        backButton
        actions={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={loading}
          >
            Save Timetable
          </Button>
        }
      />

      <Card style={{ marginBottom: 24, borderRadius: 12 }} bordered={false}>
        <Row gutter={24} align="middle">
          <Col xs={24} sm={8}>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>Class</Text>
            <Select
              placeholder="Select Class"
              style={{ width: '100%' }}
              onChange={(val) => {
                setSelectedClass(val);
                setSelectedSection(null);
              }}
              value={selectedClass}
              disabled={!!timetableId} // Disable editing class/section once created/editing
              options={classes.map(c => ({ label: c.name, value: c._id }))}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>Section</Text>
            <Select
              placeholder="Select Section"
              style={{ width: '100%' }}
              onChange={setSelectedSection}
              value={selectedSection}
              disabled={!selectedClass || !!timetableId}
              options={
                selectedClass
                  ? classes.find(c => c._id === selectedClass)?.sections.map(s => ({ label: s.name, value: s.name }))
                  : []
              }
            />
          </Col>
        </Row>
      </Card>

      {conflicts.length > 0 && (
        <Alert
          message="Schedule Conflicts Detected"
          description={
            <ul>
              {conflicts.map((c, i) => (
                <li key={i}>{c.description || `Conflict on ${c.day}`}</li>
              ))}
            </ul>
          }
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {selectedClass && selectedSection ? (
        <div style={{ overflowX: 'auto', paddingBottom: 20 }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: '8px' }}>
            <thead>
              <tr>
                <th></th>
                {days.map(day => (
                  <th key={day} style={{ textAlign: 'center', padding: 8, background: '#fff', borderRadius: 8 }}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {defaultPeriods.map(period => (
                <tr key={period}>
                  <td style={{ fontWeight: 'bold', padding: 8, verticalAlign: 'top', paddingTop: 20 }}>
                    Period {period}
                  </td>
                  {days.map(day => (
                    <td key={`${day}-${period}`} style={{ verticalAlign: 'top' }}>
                      {renderTimetableCell(day, period)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !timetableId && (
          <div style={{ textAlign: 'center', padding: '60px 0', background: '#8c8c8c', borderRadius: 12 }}>
            <CalendarOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
            <Title level={4} style={{ color: ' #fff' }}>Start Building Timetable</Title>
            <Text type="secondary">Select a class and section to begin</Text>
          </div>
        )
      )}
    </div>
  );
}

export default function TimetableBuilderPage() {
  return (
    <Suspense fallback={<Spin />}>
      <TimetableBuilderContent />
    </Suspense>
  );
}
