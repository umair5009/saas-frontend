// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import {
//     Card,
//     Row,
//     Col,
//     Button,
//     Space,
//     Form,
//     Select,
//     message,
//     Typography,
//     Descriptions,
//     Table,
//     Tag,
//     Divider,
//     Spin,
// } from 'antd';
// import {
//     SearchOutlined,
//     DownloadOutlined,
//     PrinterOutlined,
//     FileTextOutlined,
//     TrophyOutlined,
//     UserOutlined,
// } from '@ant-design/icons';
// import PageHeader from '@/components/common/PageHeader';
// import { examApi } from '@/lib/api';
// import { studentsApi } from '@/lib/api';
// import dayjs from 'dayjs';

// const { Title, Text } = Typography;
// const { Option } = Select;

// export default function ReportCardsPage() {
//     const router = useRouter();
//     const [students, setStudents] = useState([]);
//     const [selectedStudent, setSelectedStudent] = useState(null);
//     const [reportCard, setReportCard] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [filters, setFilters] = useState({});
//     const [form] = Form.useForm();

//     useEffect(() => {
//         fetchStudents();
//     }, []);

//     const fetchStudents = async () => {
//         try {
//             const data = await studentsApi.getAll();
//             if (data.success) {
//                 setStudents(data.data || []);
//             }
//         } catch (error) {
//             console.error('Error fetching students:', error);
//         }
//     };

//     const handleGenerateReportCard = async (values) => {
//         if (!selectedStudent) {
//             message.warning('Please select a student');
//             return;
//         }

//         setLoading(true);
//         try {
//             const params = {
//                 academicYear: values.academicYear,
//                 term: values.term,
//             };

//             const data = await examApi.getReportCard(selectedStudent, params);
//             if (data.success) {
//                 setReportCard(data.data);
//                 message.success('Report card generated successfully');
//             }
//         } catch (error) {
//             message.error(error.response?.data?.message || 'Failed to generate report card');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handlePrint = () => {
//         window.print();
//     };

//     const handleDownload = () => {
//         message.info('Download functionality will be implemented');
//     };

//     const subjectColumns = [
//         {
//             title: 'Subject',
//             dataIndex: 'subject',
//             key: 'subject',
//             render: (subject) => <Text strong>{subject}</Text>,
//         },
//         {
//             title: 'Total Marks',
//             dataIndex: 'totalMarks',
//             key: 'totalMarks',
//         },
//         {
//             title: 'Marks Obtained',
//             dataIndex: 'marksObtained',
//             key: 'marksObtained',
//             render: (marks) => <Text strong style={{ color: '#1890ff' }}>{marks}</Text>,
//         },
//         {
//             title: 'Percentage',
//             dataIndex: 'percentage',
//             key: 'percentage',
//             render: (percentage) => `${percentage}%`,
//         },
//         {
//             title: 'Grade',
//             dataIndex: 'grade',
//             key: 'grade',
//             render: (grade) => (
//                 <Tag color="success" style={{ fontSize: 14, padding: '4px 12px' }}>
//                     {grade}
//                 </Tag>
//             ),
//         },
//         {
//             title: 'Rank',
//             dataIndex: 'rank',
//             key: 'rank',
//             render: (rank) => rank ? `#${rank}` : '-',
//         },
//     ];

//     return (
//         <div className="fade-in">
//             <PageHeader
//                 title="Report Cards"
//                 subtitle="Generate and view student report cards"
//                 breadcrumbs={[
//                     { title: 'Exams', path: '/exams' },
//                     { title: 'Report Cards' },
//                 ]}
//                 backButton
//             />

//             {/* Filters */}
//             <Card style={{ marginBottom: 24, borderRadius: 12 }}>
//                 <Form
//                     form={form}
//                     layout="vertical"
//                     onFinish={handleGenerateReportCard}
//                 >
//                     <Row gutter={16}>
//                         <Col xs={24} sm={8}>
//                             <Form.Item
//                                 name="student"
//                                 label="Select Student"
//                                 rules={[{ required: true, message: 'Please select a student' }]}
//                             >
//                                 <Select
//                                     showSearch
//                                     placeholder="Search and select student"
//                                     optionFilterProp="children"
//                                     onChange={setSelectedStudent}
//                                     filterOption={(input, option) =>
//                                         option.children.toLowerCase().includes(input.toLowerCase())
//                                     }
//                                 >
//                                     {students.map((student) => (
//                                         <Option key={student._id} value={student._id}>
//                                             {student.firstName} {student.lastName} ({student.admissionNumber}) - {student.class} {student.section}
//                                         </Option>
//                                     ))}
//                                 </Select>
//                             </Form.Item>
//                         </Col>
//                         <Col xs={24} sm={6}>
//                             <Form.Item
//                                 name="academicYear"
//                                 label="Academic Year"
//                                 rules={[{ required: true, message: 'Please select academic year' }]}
//                             >
//                                 <Select placeholder="Select Year">
//                                     <Option value="2024-2025">2024-2025</Option>
//                                     <Option value="2025-2026">2025-2026</Option>
//                                     <Option value="2026-2027">2026-2027</Option>
//                                 </Select>
//                             </Form.Item>
//                         </Col>
//                         <Col xs={24} sm={6}>
//                             <Form.Item name="term" label="Term">
//                                 <Select placeholder="Select Term" allowClear>
//                                     <Option value="First Term">First Term</Option>
//                                     <Option value="Second Term">Second Term</Option>
//                                     <Option value="Third Term">Third Term</Option>
//                                     <Option value="Annual">Annual</Option>
//                                 </Select>
//                             </Form.Item>
//                         </Col>
//                         <Col xs={24} sm={4}>
//                             <Form.Item label=" ">
//                                 <Button
//                                     type="primary"
//                                     htmlType="submit"
//                                     icon={<SearchOutlined />}
//                                     loading={loading}
//                                     block
//                                 >
//                                     Generate
//                                 </Button>
//                             </Form.Item>
//                         </Col>
//                     </Row>
//                 </Form>
//             </Card>

//             {/* Report Card */}
//             {loading && (
//                 <div style={{ textAlign: 'center', padding: 100 }}>
//                     <Spin size="large" tip="Generating report card..." />
//                 </div>
//             )}

//             {!loading && reportCard && (
//                 <Card
//                     style={{ borderRadius: 12 }}
//                     className="report-card"
//                     extra={
//                         <Space>
//                             <Button icon={<PrinterOutlined />} onClick={handlePrint}>
//                                 Print
//                             </Button>
//                             <Button icon={<DownloadOutlined />} onClick={handleDownload}>
//                                 Download PDF
//                             </Button>
//                         </Space>
//                     }
//                 >
//                     {/* Header */}
//                     <div style={{ textAlign: 'center', marginBottom: 24 }}>
//                         {reportCard.branch?.logo && (
//                             <img
//                                 src={reportCard.branch.logo}
//                                 alt="School Logo"
//                                 style={{ height: 60, marginBottom: 8 }}
//                             />
//                         )}
//                         <Title level={3} style={{ marginBottom: 4 }}>
//                             {reportCard.branch?.name}
//                         </Title>
//                         <Text type="secondary">{reportCard.branch?.address}</Text>
//                         <Divider />
//                         <Title level={4} style={{ margin: '16px 0' }}>
//                             ACADEMIC REPORT CARD
//                         </Title>
//                         {reportCard.examSchedule && (
//                             <Tag color="blue" style={{ fontSize: 14, padding: '4px 16px' }}>
//                                 {reportCard.examSchedule.name} - {reportCard.examSchedule.examType}
//                             </Tag>
//                         )}
//                     </div>

//                     {/* Student Information */}
//                     <Card type="inner" style={{ marginBottom: 24, background: '#fafafa' }}>
//                         <Descriptions column={2} bordered size="small">
//                             <Descriptions.Item label="Student Name" span={2}>
//                                 <Text strong style={{ fontSize: 16 }}>
//                                     {reportCard.student?.name}
//                                 </Text>
//                             </Descriptions.Item>
//                             <Descriptions.Item label="Admission No.">
//                                 {reportCard.student?.admissionNumber}
//                             </Descriptions.Item>
//                             <Descriptions.Item label="Roll Number">
//                                 {reportCard.student?.rollNumber}
//                             </Descriptions.Item>
//                             <Descriptions.Item label="Class">
//                                 {reportCard.student?.class} - {reportCard.student?.section}
//                             </Descriptions.Item>
//                             <Descriptions.Item label="Academic Year">
//                                 {reportCard.academicYear}
//                             </Descriptions.Item>
//                             {reportCard.term && (
//                                 <Descriptions.Item label="Term" span={2}>
//                                     {reportCard.term}
//                                 </Descriptions.Item>
//                             )}
//                         </Descriptions>
//                     </Card>

//                     {/* Subject-wise Performance */}
//                     <Title level={5} style={{ marginBottom: 16 }}>
//                         Subject-wise Performance
//                     </Title>
//                     <Table
//                         columns={subjectColumns}
//                         dataSource={reportCard.subjects}
//                         pagination={false}
//                         rowKey="subject"
//                         style={{ marginBottom: 24 }}
//                         bordered
//                     />

//                     {/* Summary */}
//                     <Row gutter={24} style={{ marginBottom: 24 }}>
//                         <Col xs={24} md={12}>
//                             <Card type="inner" title="Overall Performance" style={{ borderRadius: 8 }}>
//                                 <Descriptions column={1} size="small">
//                                     <Descriptions.Item label="Total Subjects">
//                                         {reportCard.summary?.totalSubjects}
//                                     </Descriptions.Item>
//                                     <Descriptions.Item label="Total Marks">
//                                         {reportCard.summary?.totalMarks}
//                                     </Descriptions.Item>
//                                     <Descriptions.Item label="Marks Obtained">
//                                         <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
//                                             {reportCard.summary?.obtainedMarks}
//                                         </Text>
//                                     </Descriptions.Item>
//                                     <Descriptions.Item label="Percentage">
//                                         <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
//                                             {reportCard.summary?.percentage}%
//                                         </Text>
//                                     </Descriptions.Item>
//                                     <Descriptions.Item label="GPA">
//                                         <Text strong style={{ fontSize: 16 }}>
//                                             {reportCard.summary?.gpa}
//                                         </Text>
//                                     </Descriptions.Item>
//                                     <Descriptions.Item label="Result">
//                                         <Tag
//                                             color={reportCard.summary?.result === 'PASS' ? 'success' : 'error'}
//                                             style={{ fontSize: 14, padding: '4px 16px' }}
//                                         >
//                                             {reportCard.summary?.result}
//                                         </Tag>
//                                     </Descriptions.Item>
//                                 </Descriptions>
//                             </Card>
//                         </Col>
//                         {reportCard.attendance && (
//                             <Col xs={24} md={12}>
//                                 <Card type="inner" title="Attendance Summary" style={{ borderRadius: 8 }}>
//                                     <Descriptions column={1} size="small">
//                                         <Descriptions.Item label="Total Days">
//                                             {reportCard.attendance?.totalDays}
//                                         </Descriptions.Item>
//                                         <Descriptions.Item label="Present">
//                                             {reportCard.attendance?.present}
//                                         </Descriptions.Item>
//                                         <Descriptions.Item label="Absent">
//                                             {reportCard.attendance?.absent}
//                                         </Descriptions.Item>
//                                         <Descriptions.Item label="Attendance %">
//                                             <Text strong style={{ fontSize: 16 }}>
//                                                 {reportCard.attendance?.percentage}%
//                                             </Text>
//                                         </Descriptions.Item>
//                                     </Descriptions>
//                                 </Card>
//                             </Col>
//                         )}
//                     </Row>

//                     {/* Footer */}
//                     <div style={{ marginTop: 40, textAlign: 'right' }}>
//                         <Text type="secondary">
//                             Generated on: {dayjs(reportCard.generatedAt).format('DD MMM YYYY, hh:mm A')}
//                         </Text>
//                     </div>
//                 </Card>
//             )}

//             {!loading && !reportCard && (
//                 <Card style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
//                     <FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
//                     <Title level={4} type="secondary">
//                         No Report Card Generated
//                     </Title>
//                     <Text type="secondary">
//                         Select a student and filters above to generate a report card
//                     </Text>
//                 </Card>
//             )}

//             <style jsx global>{`
//         @media print {
//           .ant-page-header,
//           .ant-card-head,
//           button,
//           .no-print {
//             display: none !important;
//           }
//           .report-card {
//             box-shadow: none !important;
//             border: none !important;
//           }
//         }
//       `}</style>
//         </div>
//     );
// }
