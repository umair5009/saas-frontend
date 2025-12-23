'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Card,
    Row,
    Col,
    Button,
    Space,
    Table,
    Form,
    InputNumber,
    Select,
    message,
    Tag,
    Typography,
    Statistic,
    Progress,
    Modal,
    Input,
    Divider,
} from 'antd';
import {
    SaveOutlined,
    CheckCircleOutlined,
    UserOutlined,
    BookOutlined,
    TrophyOutlined,
    LockOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { examApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function MarksEntryPage() {
    const router = useRouter();
    const params = useParams();
    const examId = params.id;

    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [studentMarks, setStudentMarks] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        if (examId) {
            fetchExam();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [examId]);

    const fetchExam = async () => {
        setLoading(true);
        try {
            const data = await examApi.getById(examId);
            if (data.success) {
                setExam(data.data);
                setStudentMarks(data.data.studentMarks || []);
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to fetch exam details');
        } finally {
            setLoading(false);
        }
    };

    const initializeStudents = async () => {
        try {
            console.log('🔄 Initializing students for exam:', examId);
            const data = await examApi.initializeStudents(examId);
            console.log('✅ Initialize response:', data);

            if (data.success) {
                message.success(data.message || 'Students initialized successfully');
                fetchExam();
            }
        } catch (error) {
            console.error('❌ Error initializing students:', error);
            message.error(error.response?.data?.message || 'Failed to initialize students');
        }
    };

    const handleSaveMark = async (student) => {
        setSaving(true);
        try {
            const markData = {
                studentId: student.student._id || student.student,
                marksObtained: student.marksObtained,
                status: student.status || 'appeared',
                remarks: student.remarks,
                teacherComments: student.teacherComments,
            };

            const data = await examApi.enterMarks(examId, markData);
            if (data.success) {
                message.success('Marks saved successfully');
                fetchExam(); // Refresh to get updated data
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to save marks');
        } finally {
            setSaving(false);
        }
    };

    const [modal, contextHolder] = Modal.useModal();

    const handleBulkSave = async () => {
        modal.confirm({
            title: 'Save All Marks',
            content: 'Are you sure you want to save all entered marks?',
            okText: 'Save',
            onOk: async () => {
                setSaving(true);
                try {
                    const marksList = studentMarks
                        .filter(m => m.marksObtained !== null && m.marksObtained !== undefined)
                        .map(m => ({
                            studentId: m.student._id || m.student,
                            marksObtained: m.marksObtained,
                            status: m.status || 'appeared',
                            remarks: m.remarks,
                        }));

                    const { data } = await examApi.bulkEnterMarks(examId, { marksList });
                    if (data.success) {
                        message.success('All marks saved successfully');
                        fetchExam();
                    }
                } catch (error) {
                    message.error(error.response?.data?.message || 'Failed to save marks');
                } finally {
                    setSaving(false);
                }
            },
        });
    };

    const handleVerifyMarks = async () => {
        console.log('verify marks');
        modal.confirm({
            title: 'Verify Marks',
            content: 'This will mark all entered marks as verified. Continue?',
            okText: 'Verify',
            onOk: async () => {
                setSaving(true);
                try {
                    const studentIds = studentMarks
                        .filter(m => m.marksObtained !== null && m.marksObtained !== undefined)
                        .map(m => m.student._id || m.student);

                    const data = await examApi.verifyMarks(examId, { studentIds });
                    if (data.success) {
                        message.success('Marks verified successfully');
                        fetchExam();
                    }
                } catch (error) {
                    message.error(error.response?.data?.message || 'Failed to verify marks');
                } finally {
                    setSaving(false);
                }
            },
        });
    };

    const handlePublishResults = async () => {
        modal.confirm({
            title: 'Publish Results',
            content: 'Are you sure you want to publish the results? This will calculate ranks, statistics, and lock the exam.',
            okText: 'Publish',
            okType: 'danger',
            onOk: async () => {
                try {
                    const { data } = await examApi.publishResults(examId);
                    if (data.success) {
                        message.success('Results published successfully');
                        fetchExam();
                    }
                } catch (error) {
                    message.error(error.response?.data?.message || 'Failed to publish results');
                }
            },
        });
    };

    const columns = [
        {
            title: 'Roll No.',
            dataIndex: ['student', 'rollNumber'],
            key: 'rollNumber',
            width: 80,
            fixed: 'left',
        },
        {
            title: 'Student Name',
            key: 'studentName',
            width: 200,
            fixed: 'left',
            render: (_, record) => (
                <Space>
                    <UserOutlined />
                    <div>
                        <div>
                            {record.student?.firstName} {record.student?.lastName}
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.student?.admissionNumber}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            width: 150,
            render: (_, record, index) => (
                <Select
                    style={{ width: 130 }}
                    value={record.status || 'pending'}
                    onChange={(value) => {
                        const updated = [...studentMarks];
                        updated[index].status = value;
                        if (value !== 'appeared') {
                            updated[index].marksObtained = null;
                        }
                        setStudentMarks(updated);
                    }}
                    disabled={exam?.isLocked}
                >
                    <Option value="pending">Pending</Option>
                    <Option value="appeared">Appeared</Option>
                    <Option value="absent">Absent</Option>
                    <Option value="withheld">Withheld</Option>
                    <Option value="medical">Medical</Option>
                    <Option value="malpractice">Malpractice</Option>
                </Select>
            ),
        },
        {
            title: `Marks (Out of ${exam?.totalMarks || 100})`,
            key: 'marksObtained',
            width: 150,
            render: (_, record, index) => (
                <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={exam?.totalMarks}
                    value={record.marksObtained}
                    onChange={(value) => {
                        const updated = [...studentMarks];
                        updated[index].marksObtained = value;
                        setStudentMarks(updated);
                    }}
                    disabled={record.status !== 'appeared' || exam?.isLocked}
                    placeholder="Enter marks"
                />
            ),
        },
        {
            title: 'Grade',
            key: 'grade',
            width: 100,
            render: (_, record) => {
                if (record.grade) {
                    return (
                        <Tag color={record.isPassed ? 'success' : 'error'}>
                            {record.grade}
                        </Tag>
                    );
                }
                return <Text type="secondary">-</Text>;
            },
        },
        {
            title: 'Percentage',
            key: 'percentage',
            width: 100,
            render: (_, record) => {
                if (record.percentage) {
                    return `${record.percentage}%`;
                }
                return <Text type="secondary">-</Text>;
            },
        },
        {
            title: 'Rank',
            key: 'rank',
            width: 80,
            render: (_, record) => {
                if (record.rank) {
                    return <Tag color="gold">#{record.rank}</Tag>;
                }
                return <Text type="secondary">-</Text>;
            },
        },
        {
            title: 'Remarks',
            key: 'remarks',
            width: 200,
            render: (_, record, index) => (
                <Input
                    placeholder="Add remarks"
                    value={record.remarks}
                    onChange={(e) => {
                        const updated = [...studentMarks];
                        updated[index].remarks = e.target.value;
                        setStudentMarks(updated);
                    }}
                    disabled={exam?.isLocked}
                />
            ),
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Button
                    type="link"
                    size="small"
                    icon={<SaveOutlined />}
                    onClick={() => handleSaveMark(record)}
                    loading={saving}
                    disabled={exam?.isLocked}
                >
                    Save
                </Button>
            ),
        },
    ];

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 100 }}>Loading...</div>;
    }

    if (!exam) {
        return (
            <Card>
                <Text>Exam not found</Text>
                <Button onClick={() => router.back()}>Back</Button>
            </Card>
        );
    }

    const enteredCount = studentMarks.filter(m => m.marksObtained !== null && m.marksObtained !== undefined).length;
    const totalStudents = studentMarks.length;
    const progressPercent = totalStudents > 0 ? (enteredCount / totalStudents) * 100 : 0;
    const statistics = exam.statistics || {};

    return (
        <div className="fade-in">
            {contextHolder}
            <PageHeader
                title={`Marks Entry - ${exam.subject}`}
                subtitle={`${exam.class} ${exam.section} • ${dayjs(exam.examDate).format('DD MMM YYYY')}`}
                breadcrumbs={[
                    { title: 'Exams', path: '/exams' },
                    { title: exam.subject, path: `/exams/${examId}` },
                    { title: 'Marks Entry' },
                ]}
                backButton
                actions={
                    <Space>
                        {studentMarks.length === 0 && (
                            <Button
                                icon={<UserOutlined />}
                                onClick={initializeStudents}
                            >
                                Initialize Students
                            </Button>
                        )}
                        <Button
                            icon={<CheckCircleOutlined />}
                            onClick={handleVerifyMarks}
                            loading={saving}
                            disabled={exam?.isLocked || enteredCount === 0}
                        >
                            Verify Marks
                        </Button>
                        <Button
                            icon={<SaveOutlined />}
                            onClick={handleBulkSave}
                            loading={saving}
                            disabled={exam?.isLocked || enteredCount === 0}
                        >
                            Save All Marks
                        </Button>
                        <Button
                            type="primary"
                            icon={<TrophyOutlined />}
                            onClick={handlePublishResults}
                            disabled={exam?.isLocked || enteredCount < totalStudents}
                        >
                            Publish Results
                        </Button>
                    </Space>
                }
            />

            {/* Stats */}
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={exam.isLocked ? 4 : 6}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Total Students"
                            value={totalStudents}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={exam.isLocked ? 4 : 6}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Marks Entered"
                            value={enteredCount}
                            suffix={`/ ${totalStudents}`}
                            valueStyle={{ color: enteredCount === totalStudents ? '#52c41a' : '#1890ff' }}
                        />
                    </Card>
                </Col>
                {exam.isLocked && (
                    <>
                        <Col xs={24} sm={4}>
                            <Card style={{ borderRadius: 12 }}>
                                <Statistic
                                    title="Highest"
                                    value={statistics.highest || 0}
                                    prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                                    suffix={`/ ${exam.totalMarks}`}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={4}>
                            <Card style={{ borderRadius: 12 }}>
                                <Statistic
                                    title="Average"
                                    value={statistics.average || 0}
                                    precision={1}
                                    suffix="%"
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={4}>
                            <Card style={{ borderRadius: 12 }}>
                                <Statistic
                                    title="Lowest"
                                    value={statistics.lowest || 0}
                                    prefix={<BookOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={4}>
                            <Card style={{ borderRadius: 12 }}>
                                <Statistic
                                    title="Passed"
                                    value={statistics.passCount || 0}
                                    valueStyle={{ color: '#52c41a' }}
                                    suffix={`/ ${totalStudents}`}
                                />
                            </Card>
                        </Col>
                    </>
                )}
                {!exam.isLocked && (
                    <>
                        <Col xs={24} sm={6}>
                            <Card style={{ borderRadius: 12 }}>
                                <Statistic
                                    title="Total Marks"
                                    value={exam.totalMarks}
                                    prefix={<BookOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={6}>
                            <Card style={{ borderRadius: 12 }}>
                                <Statistic
                                    title="Passing Marks"
                                    value={exam.passingMarks}
                                    prefix={<TrophyOutlined />}
                                />
                            </Card>
                        </Col>
                    </>
                )}
            </Row>

            {/* Progress */}
            <Card style={{ marginBottom: 24, borderRadius: 12 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text strong>Entry Progress</Text>
                        {exam?.isLocked && (
                            <Tag icon={<LockOutlined />} color="warning">
                                Results Published - Editing Locked
                            </Tag>
                        )}
                    </div>
                    <Progress
                        percent={Math.round(progressPercent)}
                        status={progressPercent === 100 ? 'success' : 'active'}
                        format={() => `${enteredCount} / ${totalStudents}`}
                    />
                </Space>
            </Card>

            {/* Marks Entry Table */}
            <Card style={{ borderRadius: 12 }} title="Student Marks">
                <Table
                    columns={columns}
                    dataSource={studentMarks}
                    rowKey={(record) => record._id || record.student?._id || record.student}
                    pagination={{ pageSize: 50 }}
                    scroll={{ x: 1200 }}
                    loading={loading}
                    locale={{
                        emptyText: (
                            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                                <UserOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
                                <Title level={4} type="secondary">No Students Added Yet</Title>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                                    Click the "Initialize Students" button above to automatically add all students from {exam?.class} {exam?.section || ''} to this exam.
                                </Text>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<UserOutlined />}
                                    onClick={initializeStudents}
                                >
                                    Initialize Students Now
                                </Button>
                            </div>
                        )
                    }}
                />
            </Card>
        </div>
    );
}
