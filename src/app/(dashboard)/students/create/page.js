'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  Row,
  Col,
  Divider,
  message,
  Space,
  Upload,
  Steps,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  PlusOutlined,
  SaveOutlined,
  BookOutlined,
  TeamOutlined,
  HeartOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { studentApi, academicApi, feeApi } from '@/lib/api';

const { Option } = Select;
const { TextArea } = Input;

export default function CreateStudentPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [sections, setSections] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [discountRules, setDiscountRules] = useState([]);

  const steps = [
    { title: 'Personal', icon: <UserOutlined /> },
    { title: 'Academic', icon: <BookOutlined /> },
    { title: 'Guardian', icon: <TeamOutlined /> },
    { title: 'Additional', icon: <HeartOutlined /> },
  ];

  // Fetch classes and academic years on mount
  useEffect(() => {
    fetchClasses();
    fetchAcademicYears();
    fetchScholarships();
    fetchDiscounts();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await academicApi.getClasses();
      if (data.success) {
        setClasses(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const data = await academicApi.getAcademicYears();
      if (data.success) {
        setAcademicYears(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch academic years:', error);
    }
  };

  const fetchScholarships = async () => {
    try {
      const response = await feeApi.getScholarships({ isActive: true });
      if (response.success) setScholarships(response.data);
    } catch (error) {
      console.error("Failed to fetch scholarships");
    }
  };

  const fetchDiscounts = async () => {
    try {
      const response = await feeApi.getDiscountRules({ isActive: true });
      if (response.success) setDiscountRules(response.data);
    } catch (error) {
      console.error("Failed to fetch discounts");
    }
  };

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    const selectedClassData = classes.find(c => c._id === classId);
    if (selectedClassData) {
      setSections(selectedClassData.sections || []);
    } else {
      setSections([]);
    }
    // Reset section when class changes
    form.setFieldValue('section', undefined);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Transform date fields
      const data = {
        ...values,
        dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'),
        admissionDate: values.admissionDate?.format('YYYY-MM-DD'),
        feeDetails: {
          scholarship: values.scholarship,
          discounts: values.discounts
        }
      };

      console.log('Submitting student data:', data);
      await studentApi.create(data);
      message.success('Student created successfully!');
      router.push('/students');
    } catch (error) {
      console.error('Error creating student:', error);
      message.error(error.message || 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    try {
      // Validate current step fields
      const stepFields = getStepFields(currentStep);
      await form.validateFields(stepFields);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      // Validation failed
    }
  };

  const getStepFields = (step) => {
    switch (step) {
      case 0:
        return ['firstName', 'lastName', 'email', 'dateOfBirth', 'gender'];
      case 1:
        return ['class', 'section', 'academicYear'];
      case 2:
        return [['guardians', 0, 'type'], ['guardians', 0, 'firstName'], ['guardians', 0, 'lastName'], ['guardians', 0, 'phone'], ['emergencyContact', 'name'], ['emergencyContact', 'relation'], ['emergencyContact', 'phone']];
      default:
        return [];
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Add New Student"
        subtitle="Register a new student in the system"
        breadcrumbs={[
          { title: 'Students', path: '/students' },
          { title: 'Create' },
        ]}
        backButton
      />

      {/* Steps */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Steps
          current={currentStep}
          items={steps.map((step) => ({
            title: step.title,
            icon: step.icon,
          }))}
        />
      </Card>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          gender: 'male',
          status: 'active',
          guardians: [{ type: 'father', isPrimary: true }],
        }}
      >
        {/* Step 1: Personal Information */}
        <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
          <Card title="Personal Information" style={{ borderRadius: 12 }}>
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[{ required: true, message: 'Please enter first name' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="First Name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="middleName" label="Middle Name">
                  <Input placeholder="Middle Name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[{ required: true, message: 'Please enter last name' }]}
                >
                  <Input placeholder="Last Name" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Invalid email' },
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Email" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="phone" label="Phone">
                  <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="dateOfBirth"
                  label="Date of Birth"
                  rules={[{ required: true, message: 'Please select date of birth' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="gender"
                  label="Gender"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select Gender">
                    <Option value="male">Male</Option>
                    <Option value="female">Female</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="bloodGroup" label="Blood Group">
                  <Select placeholder="Select Blood Group">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <Option key={bg} value={bg}>{bg}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="religion" label="Religion">
                  <Input placeholder="Religion" />
                </Form.Item>
              </Col>
            </Row>

            <Divider>Address</Divider>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item name={['address', 'street']} label="Street Address">
                  <Input prefix={<HomeOutlined />} placeholder="Street Address" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name={['address', 'city']} label="City">
                  <Input placeholder="City" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name={['address', 'postalCode']} label="Postal Code">
                  <Input placeholder="Postal Code" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </div>

        {/* Step 2: Academic Information */}
        <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
          <Card title="Academic Information" style={{ borderRadius: 12 }}>
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="class"
                  label="Class"
                  rules={[{ required: true, message: 'Please select class' }]}
                >
                  <Select
                    placeholder="Select Class"
                    onChange={handleClassChange}
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {classes.map((cls) => (
                      <Option key={cls._id} value={cls._id}>{cls.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="section"
                  label="Section"
                  rules={[{ required: true, message: 'Please select section' }]}
                >
                  <Select
                    placeholder="Select Section"
                    disabled={!selectedClass || sections.length === 0}
                  >
                    {sections.map((section) => (
                      <Option key={section.name} value={section.name}>
                        Section {section.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="academicYear"
                  label="Academic Year"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select Academic Year">
                    {academicYears.map((year) => (
                      <Option key={year._id} value={year.name}>
                        {year.name} {year.isCurrent && '(Current)'}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item name="rollNumber" label="Roll Number">
                  <Input placeholder="Roll Number" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="admissionDate" label="Admission Date">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="status" label="Status">
                  <Select>
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider>Previous School (Optional)</Divider>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item name={['previousSchool', 'name']} label="School Name">
                  <Input placeholder="Previous School Name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name={['previousSchool', 'lastClass']} label="Last Class">
                  <Input placeholder="Last Class Attended" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name={['previousSchool', 'tcNumber']} label="TC Number">
                  <Input placeholder="Transfer Certificate No." />
                </Form.Item>
              </Col>
            </Row>

            <Divider>Fee Information</Divider>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item name="scholarship" label="Scholarship">
                  <Select placeholder="Select Scholarship" allowClear>
                    {scholarships.map(s => (
                      <Option key={s._id} value={s._id}>{s.name} ({s.amount || s.percentage + '%'})</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="discounts" label="Applicable Discounts">
                  <Select mode="multiple" placeholder="Select Discounts" allowClear>
                    {discountRules.map(d => (
                      <Option key={d._id} value={d._id}>{d.name} ({d.amount || d.percentage + '%'})</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </div>

        {/* Step 3: Guardian Information */}
        <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
          <Card title="Guardian Information" style={{ borderRadius: 12 }}>
            <Form.List name="guardians">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <div key={key}>
                      {index > 0 && <Divider />}
                      <Row gutter={24}>
                        <Col xs={24} md={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'type']}
                            label="Relation"
                            rules={[{ required: true }]}
                          >
                            <Select placeholder="Select Relation">
                              <Option value="father">Father</Option>
                              <Option value="mother">Mother</Option>
                              <Option value="guardian">Guardian</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'firstName']}
                            label="First Name"
                            rules={[{ required: true }]}
                          >
                            <Input placeholder="First Name" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'lastName']}
                            label="Last Name"
                            rules={[{ required: true }]}
                          >
                            <Input placeholder="Last Name" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'phone']}
                            label="Phone"
                            rules={[{ required: true }]}
                          >
                            <Input placeholder="Phone Number" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={24}>
                        <Col xs={24} md={8}>
                          <Form.Item {...restField} name={[name, 'email']} label="Email">
                            <Input placeholder="Email" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item {...restField} name={[name, 'occupation']} label="Occupation">
                            <Input placeholder="Occupation" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item {...restField} name={[name, 'cnic']} label="CNIC">
                            <Input placeholder="CNIC Number" />
                          </Form.Item>
                        </Col>
                      </Row>
                      {index > 0 && (
                        <Button type="link" danger onClick={() => remove(name)}>
                          Remove Guardian
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    Add Another Guardian
                  </Button>
                </>
              )}
            </Form.List>

            <Divider>Emergency Contact</Divider>

            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item
                  name={['emergencyContact', 'name']}
                  label="Contact Name"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Emergency Contact Name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name={['emergencyContact', 'relation']}
                  label="Relation"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Relation" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name={['emergencyContact', 'phone']}
                  label="Phone"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Phone Number" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </div>

        {/* Step 4: Additional Information */}
        <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
          <Card title="Additional Information" style={{ borderRadius: 12 }}>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label="Student Photo">
                  <Upload listType="picture-card" maxCount={1}>
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Documents">
                  <Upload.Dragger maxCount={5}>
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag files to upload</p>
                    <p className="ant-upload-hint">
                      Upload birth certificate, previous school records, etc.
                    </p>
                  </Upload.Dragger>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item name={['medicalInfo', 'allergies']} label="Allergies (if any)">
                  <TextArea rows={3} placeholder="List any allergies..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name={['medicalInfo', 'chronicConditions']} label="Medical Conditions">
                  <TextArea rows={3} placeholder="List any chronic conditions..." />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={24}>
                <Form.Item name="remarks" label="Remarks">
                  <TextArea rows={3} placeholder="Any additional remarks..." />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </div>

        {/* Navigation Buttons */}
        <Card style={{ marginTop: 24, borderRadius: 12 }}>
          <Row justify="space-between">
            <Col>
              {currentStep > 0 && (
                <Button onClick={() => setCurrentStep(currentStep - 1)}>
                  Previous
                </Button>
              )}
            </Col>
            <Col>
              <Space>
                <Button onClick={() => router.push('/students')}>Cancel</Button>
                {currentStep < steps.length - 1 ? (
                  <Button type="primary" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    Create Student
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  );
}

