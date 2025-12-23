'use client';

import { useState } from 'react';
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
  InputNumber,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  SaveOutlined,
  UploadOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { staffApi } from '@/lib/api';

const { Option } = Select;
const { TextArea } = Input;

export default function CreateStaffPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Personal', icon: <UserOutlined /> },
    { title: 'Employment', icon: <PlusOutlined /> },
    { title: 'Salary', icon: <DollarOutlined /> },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Transform date fields
      const data = {
        ...values,
        dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'),
        joiningDate: values.joiningDate?.format('YYYY-MM-DD'),
        confirmationDate: values.confirmationDate?.format('YYYY-MM-DD'),
      };

      await staffApi.create(data);
      message.success('Staff member created successfully!');
      router.push('/staff');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create staff member');
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
        return ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender'];
      case 1:
        return ['employeeId', 'department', 'designation', 'joiningDate'];
      case 2:
        return ['basicSalary', 'allowances'];
      default:
        return [];
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Add New Staff"
        subtitle="Register a new staff member in the system"
        breadcrumbs={[
          { title: 'Staff', path: '/staff' },
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
          employmentType: 'permanent',
        }}
      >
        {/* Step 1: Personal Information */}
        {currentStep === 0 && (
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
                <Form.Item
                  name="phone"
                  label="Phone"
                  rules={[{ required: true, message: 'Please enter phone number' }]}
                >
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
              <Col xs={24} md={6}>
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
              <Col xs={24} md={6}>
                <Form.Item name="bloodGroup" label="Blood Group">
                  <Select placeholder="Select Blood Group">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <Option key={bg} value={bg}>{bg}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="religion" label="Religion">
                  <Input placeholder="Religion" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="nationality" label="Nationality">
                  <Input placeholder="Nationality" />
                </Form.Item>
              </Col>
            </Row>

            <Divider>Address</Divider>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item name={['address', 'street']} label="Street Address">
                  <Input placeholder="Street Address" />
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
        )}

        {/* Step 2: Employment Information */}
        {currentStep === 1 && (
          <Card title="Employment Information" style={{ borderRadius: 12 }}>
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="employeeId"
                  label="Employee ID"
                  rules={[{ required: true, message: 'Please enter employee ID' }]}
                >
                  <Input placeholder="EMP2025001" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="department"
                  label="Department"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select Department">
                    <Option value="academic">Academic</Option>
                    <Option value="administration">Administration</Option>
                    <Option value="accounts">Accounts</Option>
                    <Option value="library">Library</Option>
                    <Option value="sports">Sports</Option>
                    <Option value="it">IT</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="designation"
                  label="Designation"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Teacher, Accountant, etc." />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={6}>
                <Form.Item
                  name="role"
                  label="Role"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select Role">
                    <Option value="teacher">Teacher</Option>
                    <Option value="admin_staff">Admin Staff</Option>
                    <Option value="accountant">Accountant</Option>
                    <Option value="librarian">Librarian</Option>
                    <Option value="lab_assistant">Lab Assistant</Option>
                    <Option value="driver">Driver</Option>
                    <Option value="security">Security</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="employmentType"
                  label="Employment Type"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select Type">
                    <Option value="permanent">Permanent</Option>
                    <Option value="contract">Contract</Option>
                    <Option value="part-time">Part-time</Option>
                    <Option value="visiting">Visiting</Option>
                    <Option value="probation">Probation</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="joiningDate"
                  label="Joining Date"
                  rules={[{ required: true }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="confirmationDate" label="Confirmation Date">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Divider>Qualifications</Divider>

            <Form.List name="qualifications">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <div key={key}>
                      {index > 0 && <Divider />}
                      <Row gutter={16}>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'degree']}
                            label="Degree"
                            rules={[{ required: true }]}
                          >
                            <Input placeholder="B.Sc, M.Sc, etc." />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'institution']}
                            label="Institution"
                            rules={[{ required: true }]}
                          >
                            <Input placeholder="University Name" />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, 'year']}
                            label="Year"
                            rules={[{ required: true }]}
                          >
                            <Input placeholder="2020" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'grade']}
                            label="Grade/Percentage"
                          >
                            <Input placeholder="A+, 85%, etc." />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          {fields.length > 1 && (
                            <Button type="link" danger onClick={() => remove(name)}>
                              Remove
                            </Button>
                          )}
                        </Col>
                      </Row>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    Add Qualification
                  </Button>
                </>
              )}
            </Form.List>
          </Card>
        )}

        {/* Step 3: Salary Information */}
        {currentStep === 2 && (
          <Card title="Salary Information" style={{ borderRadius: 12 }}>
            <Row gutter={24}>
              <Col xs={24} md={6}>
                <Form.Item
                  name="basicSalary"
                  label="Basic Salary"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="houseRentAllowance" label="House Rent Allowance">
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="transportAllowance" label="Transport Allowance">
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="medicalAllowance" label="Medical Allowance">
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={6}>
                <Form.Item name="conveyanceAllowance" label="Conveyance Allowance">
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="otherAllowances" label="Other Allowances">
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="providentFund" label="Provident Fund">
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="professionalTax" label="Professional Tax">
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider>Bank Details</Divider>

            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item name="bankAccountName" label="Account Holder Name">
                  <Input placeholder="Full Name as per Bank" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="bankAccountNumber" label="Account Number">
                  <Input placeholder="Bank Account Number" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="bankName" label="Bank Name">
                  <Input placeholder="Bank Name" />
                </Form.Item>
              </Col>
            </Row>

            <Divider>Documents</Divider>

            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item label="Resume">
                  <Upload listType="picture-card" maxCount={1}>
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Degree Certificates">
                  <Upload listType="picture-card" maxCount={5}>
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="ID Proof">
                  <Upload listType="picture-card" maxCount={1}>
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        )}

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
                <Button onClick={() => router.push('/staff')}>Cancel</Button>
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
                    Create Staff Member
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