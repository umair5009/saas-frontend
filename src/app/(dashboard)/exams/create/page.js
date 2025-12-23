'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    Row,
    Col,
    Button,
    Form,
    Input,
    Select,
    DatePicker,
    TimePicker,
    InputNumber,
    message,
    Divider,
    Space,
    Typography,
    Tag,
} from 'antd';
import {
    SaveOutlined,
    BookOutlined,
    ClockCircleOutlined,
    UserOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { examApi } from '@/lib/api';
import { academicApi } from '@/lib/api/academic';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function CreateExamPage() {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [examSchedules, setExamSchedules] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [availableSections, setAvailableSections] = useState([]);

    useEffect(() => {
        fetchExamSchedules();
        fetchClasses();
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            // Find the selected class object and get its sections
            const classObj = classes.find(c => c._id === selectedClass);
            if (classObj && classObj.sections) {
                // Handle both string arrays and object arrays
                const sections = Array.isArray(classObj.sections)
                    ? classObj.sections.map(s => typeof s === 'string' ? s : s.name || s)
                    : [];
                setAvailableSections(sections);
            } else {
                setAvailableSections([]);
            }
        } else {
            setAvailableSections([]);
        }
    }, [selectedClass, classes]);

    const fetchExamSchedules = async () => {
        try {
            const data = await examApi.getSchedules({ status: 'scheduled,ongoing,published' });
            if (data.success) {
                setExamSchedules(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
        }
    };

    const fetchClasses = async () => {
        try {
            const data = await academicApi.getClasses();
            if (data.success) {
                setClasses(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            message.error('Failed to load classes');
        }
    };

    const fetchSubjects = async () => {
        try {
            const data = await academicApi.getSubjects();
            if (data.success) {
                setSubjects(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            message.error('Failed to load subjects');
        }
    };

    const handleSubmit = async (values) => {
        console.log("values submit", values)
        setLoading(true);
        try {
            // Find the class name from the ID
            const selectedClassObj = classes.find(c => c._id === values.class);
            console.log("selectedClassObj", selectedClassObj)
            const className = selectedClassObj ? selectedClassObj._id : values.class;
            console.log("className", className)
            const examData = {
                ...values,
                class: className, // Send class name to backend
                examDate: values.examDate.format('YYYY-MM-DD'),
                startTime: values.timeRange ? values.timeRange[0].format('HH:mm') : undefined,
                endTime: values.timeRange ? values.timeRange[1].format('HH:mm') : undefined,
                duration: values.timeRange
                    ? values.timeRange[1].diff(values.timeRange[0], 'minutes')
                    : undefined,
                // Calculate passing marks if not provided
                passingMarks: values.passingMarks || Math.round((values.totalMarks * 33) / 100),
            };

            delete examData.timeRange;

            const data = await examApi.create(examData);
            if (data.success) {
                const examId = data.data._id;

                // Show success modal with options
                Modal.success({
                    title: 'Exam Created Successfully!',
                    content: `${values.subject} exam for ${className} ${values.section || ''} has been created.`,
                    okText: 'Enter Marks Now',
                    cancelText: 'Back to Exams',
                    onOk: () => {
                        router.push(`/exams/${examId}/marks`);
                    },
                    onCancel: () => {
                        router.push('/exams');
                    },
                    okCancel: true,
                });
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to create exam');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <PageHeader
                title="Create Exam"
                subtitle="Add a new examination"
                breadcrumbs={[
                    { title: 'Exams', path: '/exams' },
                    { title: 'Create Exam' },
                ]}
                backButton
            />

            <Card style={{ borderRadius: 12 }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        examType: 'written',
                        status: 'scheduled',
                    }}
                >
                    <Title level={5}>
                        <BookOutlined /> Basic Information
                    </Title>
                    <Divider />

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="examSchedule"
                                label="Exam Schedule (Optional)"
                                extra="Link this exam to an exam schedule"
                            >
                                <Select
                                    placeholder="Select exam schedule (optional)"
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {examSchedules.map((schedule) => (
                                        <Option key={schedule._id} value={schedule._id}>
                                            {schedule.name} ({schedule.examType})
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="subject"
                                label="Subject"
                                rules={[{ required: true, message: 'Please select subject' }]}
                            >
                                <Select
                                    placeholder="Select Subject"
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {subjects.map((subject) => (
                                        <Option key={subject._id} value={subject.name}>
                                            {subject.name} {subject.code ? `(${subject.code})` : ''}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="class"
                                label="Class"
                                rules={[{ required: true, message: 'Please select class' }]}
                            >
                                <Select
                                    placeholder="Select Class"
                                    onChange={(value) => {
                                        console.log("value", value)
                                        setSelectedClass(value);
                                        form.setFieldsValue({ section: undefined }); // Reset section when class changes
                                    }}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {classes.map((cls) => (
                                        <Option key={cls._id} value={cls._id}>
                                            {cls.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="section"
                                label="Section"
                            >
                                <Select
                                    placeholder="Select Section"
                                    allowClear
                                    disabled={!selectedClass || availableSections.length === 0}
                                >
                                    {availableSections.map((section) => (
                                        <Option key={section} value={section}>
                                            {section}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="examType"
                                label="Exam Type"
                                rules={[{ required: true, message: 'Please select exam type' }]}
                            >
                                <Select>
                                    <Option value="written">Written</Option>
                                    <Option value="practical">Practical</Option>
                                    <Option value="oral">Oral</Option>
                                    <Option value="online">Online</Option>
                                    <Option value="project">Project</Option>
                                    <Option value="assignment">Assignment</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Title level={5} style={{ marginTop: 24 }}>
                        <ClockCircleOutlined /> Schedule
                    </Title>
                    <Divider />

                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="examDate"
                                label="Exam Date"
                                rules={[{ required: true, message: 'Please select exam date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="timeRange"
                                label="Time"
                            >
                                <TimePicker.RangePicker
                                    style={{ width: '100%' }}
                                    format="hh:mm A"
                                    use12Hours
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="room" label="Room/Hall">
                                <Input placeholder="e.g., Room 101" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Title level={5} style={{ marginTop: 24 }}>
                        Marks Configuration
                    </Title>
                    <Divider />

                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="totalMarks"
                                label="Total Marks"
                                rules={[
                                    { required: true, message: 'Please enter total marks' },
                                    { type: 'number', min: 1, message: 'Must be greater than 0' },
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="100"
                                    min={1}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="passingMarks"
                                label="Passing Marks"
                                extra="Leave empty for 33% of total marks"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="33"
                                    min={1}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="subjectCode" label="Subject Code">
                                <Input placeholder="e.g., MATH101" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Title level={5} style={{ marginTop: 24 }}>
                        Additional Details
                    </Title>
                    <Divider />

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="status" label="Status">
                                <Select>
                                    <Option value="scheduled">Scheduled</Option>
                                    <Option value="ongoing">Ongoing</Option>
                                    <Option value="completed">Completed</Option>
                                    <Option value="cancelled">Cancelled</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="marksEntryStart" label="Marks Entry Start Date">
                                <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="description" label="Description/Instructions">
                        <TextArea
                            rows={4}
                            placeholder="Additional instructions or notes for the exam"
                        />
                    </Form.Item>

                    <Divider />

                    <Space style={{ width: '100%', justifyContent: 'end' }}>
                        <Button onClick={() => router.back()}>Cancel</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            loading={loading}
                        >
                            Create Exam
                        </Button>
                    </Space>
                </Form>
            </Card>
        </div>
    );
}
