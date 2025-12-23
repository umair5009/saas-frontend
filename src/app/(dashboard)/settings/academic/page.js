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
    Input,
    Select,
    InputNumber,
    message,
    Divider,
    Typography,
    Spin,
    Alert
} from 'antd';
import {
    SaveOutlined,
    ReadOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { settingsApi } from '@/lib/api';

const { Title, Text } = Typography;
const { Option } = Select;

export default function AcademicSettingsPage() {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await settingsApi.getSettings();
            if (response.data.success) {
                const settings = response.data.data;

                form.setFieldsValue({
                    // Attendance Rules
                    minimumAttendancePercentage: settings.attendanceRules?.minimumAttendancePercentage,
                    lateArrivalMinutes: settings.attendanceRules?.lateArrivalMinutes,

                    // Grading System (Simplified for now)
                    passingPercentage: settings.gradingSystem?.passingPercentage || settings.examRules?.passingPercentage,
                    gradingType: settings.gradingSystem?.type,
                });
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to fetch academic settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        setSaving(true);
        try {
            // 1. Update Attendance Rules
            const attendanceData = {
                minimumAttendancePercentage: values.minimumAttendancePercentage,
                lateArrivalMinutes: values.lateArrivalMinutes,
            };

            // 2. Update Grading System / Exam Rules
            // We update both gradingSystem.passingPercentage and examRules.passingPercentage to keep them in sync or prefer gradingSystem
            const gradingData = {
                type: values.gradingType,
                passingPercentage: values.passingPercentage
            };

            const examRulesData = {
                passingPercentage: values.passingPercentage
            };

            await Promise.all([
                settingsApi.updateAttendanceRules(attendanceData),
                settingsApi.updateGradingSystem(gradingData),
                settingsApi.updateExamRules(examRulesData)
            ]);

            message.success('Academic settings updated successfully!');
            fetchSettings();
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="fade-in">
            <PageHeader
                title="Academic Settings"
                subtitle="Configure academic rules, grading, and attendance criteria"
                breadcrumbs={[
                    { title: 'Settings', path: '/settings' },
                    { title: 'Academic' },
                ]}
                backButton
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    minimumAttendancePercentage: 75,
                    lateArrivalMinutes: 15,
                    passingPercentage: 33,
                    gradingType: 'percentage'
                }}
            >
                <Row gutter={[24, 24]}>
                    {/* Attendance Rules */}
                    <Col xs={24} lg={12}>
                        <Card title="Attendance Configuration" style={{ borderRadius: 12 }}>
                            <div style={{ marginBottom: 24 }}>
                                <Alert
                                    message="Canonical Source"
                                    description="These settings are enforced across all modules (Attendance, Promotion)."
                                    type="info"
                                    showIcon
                                    icon={<InfoCircleOutlined />}
                                />
                            </div>

                            <Form.Item
                                name="minimumAttendancePercentage"
                                label="Minimum Attendance for Promotion (%)"
                                rules={[
                                    { required: true },
                                    { type: 'number', min: 0, max: 100 }
                                ]}
                            >
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item
                                name="lateArrivalMinutes"
                                label="Late Arrival Threshold (Minutes)"
                                tooltip="Minutes after school start time marked as late"
                                rules={[{ required: true }]}
                            >
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Card>
                    </Col>

                    {/* Grading & Exams */}
                    <Col xs={24} lg={12}>
                        <Card title="Grading & Examination" style={{ borderRadius: 12 }}>
                            <Form.Item
                                name="gradingType"
                                label="Grading System Type"
                                rules={[{ required: true }]}
                            >
                                <Select>
                                    <Option value="percentage">Percentage Based</Option>
                                    <Option value="cgpa">CGPA / GPA</Option>
                                    <Option value="letter">Letter Grading</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="passingPercentage"
                                label="Passing Percentage (%)"
                                rules={[
                                    { required: true },
                                    { type: 'number', min: 0, max: 100 }
                                ]}
                            >
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>

                            <Alert
                                message="Grading Schemes"
                                description="Detailed grade ranges can be configured in the Grade Systems module."
                                type="warning"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Save Button */}
                <Card style={{ marginTop: 24, borderRadius: 12 }}>
                    <Space style={{ width: '100%', justifyContent: 'end' }}>
                        <Button onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={saving}
                            icon={<SaveOutlined />}
                        >
                            Save Academic Settings
                        </Button>
                    </Space>
                </Card>
            </Form>
        </div>
    );
}
