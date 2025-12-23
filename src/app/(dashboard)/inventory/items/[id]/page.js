'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Card,
    Row,
    Col,
    Button,
    Space,
    Typography,
    Descriptions,
    Tag,
    Divider,
    message,
    Spin,
    Modal,
    Timeline,
    Empty,
    Statistic,
    Tooltip,
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    ArrowLeftOutlined,
    ToolOutlined,
    SwapOutlined,
    UserOutlined,
    UndoOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    CalendarOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    SafetyCertificateOutlined,
    HistoryOutlined,
    InboxOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { inventoryApi } from '@/lib/api';
import dayjs from 'dayjs';
import { Form, Input, InputNumber, Select, DatePicker, Tabs } from 'antd';

const { Title, Text, Paragraph } = Typography;

// Status configurations
const STATUS_CONFIG = {
    'available': { color: 'success', text: 'Available', icon: <CheckCircleOutlined /> },
    'in-use': { color: 'processing', text: 'In Use', icon: <ClockCircleOutlined /> },
    'allocated': { color: 'processing', text: 'Allocated', icon: <ClockCircleOutlined /> },
    'under-maintenance': { color: 'warning', text: 'Under Maintenance', icon: <ToolOutlined /> },
    'disposed': { color: 'default', text: 'Disposed', icon: <DeleteOutlined /> },
    'lost': { color: 'error', text: 'Lost', icon: <ExclamationCircleOutlined /> },
};

const CONDITION_CONFIG = {
    'new': { color: '#52c41a', text: 'New' },
    'excellent': { color: '#1890ff', text: 'Excellent' },
    'good': { color: '#13c2c2', text: 'Good' },
    'fair': { color: '#faad14', text: 'Fair' },
    'poor': { color: '#fa8c16', text: 'Poor' },
    'damaged': { color: '#ff4d4f', text: 'Damaged' },
};

export default function ItemDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch item details
    useEffect(() => {
        const fetchItem = async () => {
            try {
                const response = await inventoryApi.getItemById(params.id);
                if (response.success) {
                    setItem(response.data);
                }
            } catch (error) {
                console.error('Error fetching item:', error);
                message.error('Failed to fetch item details');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchItem();
        }
    }, [params.id]);

    const [transferModal, setTransferModal] = useState(false);
    const [maintenanceModal, setMaintenanceModal] = useState(false);
    const [historyModal, setHistoryModal] = useState(false);
    const [assignModal, setAssignModal] = useState(false);
    const [returnModal, setReturnModal] = useState(false);
    const [completeMaintenanceModal, setCompleteMaintenanceModal] = useState(false);

    // Handle delete
    const handleDelete = () => {
        Modal.confirm({
            title: 'Delete Item',
            content: `Are you sure you want to delete "${item?.name}"? This action cannot be undone.`,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await inventoryApi.deleteItem(params.id);
                    message.success('Item deleted successfully');
                    router.push('/inventory');
                } catch (error) {
                    message.error(error.response?.data?.message || 'Failed to delete item');
                }
            },
        });
    };

    const handleTransfer = async (values) => {
        try {
            await inventoryApi.transferItem(params.id, values);
            message.success('Item transferred successfully');
            setTransferModal(false);
            // Router push or refresh
            router.refresh();
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to transfer item');
        }
    };

    const handleMaintenance = async (values) => {
        try {
            await inventoryApi.scheduleMaintenance(params.id, {
                ...values,
                scheduledDate: values.scheduledDate.format('YYYY-MM-DD')
            });
            message.success('Maintenance scheduled successfully');
            setMaintenanceModal(false);
            // Refresh item
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to schedule maintenance');
        }
    };

    const handleAssign = async (values) => {
        try {
            await inventoryApi.assignItem(params.id, {
                ...values,
                expectedReturnDate: values.expectedReturnDate?.format('YYYY-MM-DD')
            });
            message.success('Item assigned successfully');
            setAssignModal(false);

            // Refresh item details
            const response = await inventoryApi.getItemById(params.id);
            if (response.success) {
                setItem(response.data);
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to assign item');
        }
    };

    const handleReturn = async (values) => {
        try {
            await inventoryApi.returnItem(params.id, values);
            message.success('Item returned successfully');
            setReturnModal(false);

            // Refresh item details
            const response = await inventoryApi.getItemById(params.id);
            if (response.success) {
                setItem(response.data);
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to return item');
        }
    };

    const handleCompleteMaintenance = async (values) => {
        try {
            // Find active maintenance record (safest to take the last one if under maintenance)
            const maintenanceRecord = item.maintenanceHistory && item.maintenanceHistory.length > 0
                ? item.maintenanceHistory[item.maintenanceHistory.length - 1]
                : null;

            if (!maintenanceRecord) {
                message.error('No maintenance record found to complete');
                return;
            }

            await inventoryApi.completeMaintenance(params.id, {
                ...values,
                maintenanceId: maintenanceRecord._id
            });

            message.success('Maintenance completed successfully');
            setCompleteMaintenanceModal(false);

            // Refresh item details
            const response = await inventoryApi.getItemById(params.id);
            if (response.success) {
                setItem(response.data);
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to complete maintenance');
        }
    };

    // Render status tag
    const renderStatusTag = (status) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG['available'];
        return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
    };

    // Render condition tag
    const renderConditionTag = (condition) => {
        const config = CONDITION_CONFIG[condition] || CONDITION_CONFIG['good'];
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!item) {
        return (
            <div className="fade-in">
                <PageHeader
                    title="Item Not Found"
                    breadcrumbs={[
                        { title: 'Inventory', path: '/inventory' },
                        { title: 'Item Details' },
                    ]}
                    backButton
                />
                <Empty description="The requested item could not be found" />
            </div>
        );
    }

    return (
        <div className="fade-in">
            <PageHeader
                title={item.name}
                subtitle={`Asset Tag: ${item.assetTag || 'Not assigned'}`}
                breadcrumbs={[
                    { title: 'Inventory', path: '/inventory' },
                    { title: item.name },
                ]}
                backButton
                actions={
                    <Space>
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => router.push(`/inventory/items/${params.id}/edit`)}
                        >
                            Edit
                        </Button>
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={handleDelete}
                            disabled={item.allocation?.isAllocated}
                        >
                            Delete
                        </Button>
                    </Space>
                }
            />

            {/* Status Overview */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 12, textAlign: 'center' }}>
                        <Text type="secondary">Status</Text>
                        <div style={{ marginTop: 8 }}>{renderStatusTag(item.status)}</div>
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 12, textAlign: 'center' }}>
                        <Text type="secondary">Condition</Text>
                        <div style={{ marginTop: 8 }}>{renderConditionTag(item.condition)}</div>
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Current Value"
                            value={item.financials?.currentValue || item.purchase?.purchasePrice || 0}
                            prefix="Rs."
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Quantity"
                            value={item.quantity || 1}
                            suffix={item.unit || 'pcs'}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                {/* Main Details */}
                <Col xs={24} lg={16}>
                    <Card title="Item Details" style={{ borderRadius: 12, marginBottom: 16 }}>
                        <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered size="small">
                            <Descriptions.Item label="Asset Tag">{item.assetTag || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Serial Number">{item.serialNumber || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Type">
                                <Tag color="blue">{item.type?.replace('-', ' ').toUpperCase()}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Category">{item.category?.name || item.subcategory || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Brand">{item.brand || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Model">{item.model || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Manufacturer">{item.manufacturer || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Barcode">{item.barcode || '-'}</Descriptions.Item>
                        </Descriptions>

                        {item.description && (
                            <div style={{ marginTop: 16 }}>
                                <Text strong>Description:</Text>
                                <Paragraph style={{ marginTop: 8 }}>{item.description}</Paragraph>
                            </div>
                        )}
                    </Card>

                    {/* Purchase Information */}
                    <Card
                        title={<><DollarOutlined /> Purchase Information</>}
                        style={{ borderRadius: 12, marginBottom: 16 }}
                    >
                        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                            <Descriptions.Item label="Purchase Date">
                                {item.purchase?.purchaseDate ? dayjs(item.purchase.purchaseDate).format('DD MMM YYYY') : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Purchase Price">
                                Rs. {(item.purchase?.purchasePrice || 0).toLocaleString()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Invoice Number">{item.purchase?.invoiceNumber || '-'}</Descriptions.Item>
                            <Descriptions.Item label="PO Number">{item.purchase?.purchaseOrderNumber || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Vendor">{item.purchase?.vendor?.name || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Vendor Contact">{item.purchase?.vendor?.phone || item.purchase?.vendor?.email || '-'}</Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Financial/Depreciation */}
                    {item.financials && (
                        <Card
                            title={<><HistoryOutlined /> Financial Information</>}
                            style={{ borderRadius: 12, marginBottom: 16 }}
                        >
                            <Row gutter={16}>
                                <Col xs={12} sm={6}>
                                    <Statistic
                                        title="Original Value"
                                        value={item.financials.originalValue || 0}
                                        prefix="Rs."
                                        valueStyle={{ fontSize: 18 }}
                                    />
                                </Col>
                                <Col xs={12} sm={6}>
                                    <Statistic
                                        title="Current Value"
                                        value={item.financials.currentValue || 0}
                                        prefix="Rs."
                                        valueStyle={{ fontSize: 18, color: '#1890ff' }}
                                    />
                                </Col>
                                <Col xs={12} sm={6}>
                                    <Statistic
                                        title="Accumulated Depreciation"
                                        value={item.financials.accumulatedDepreciation || 0}
                                        prefix="Rs."
                                        valueStyle={{ fontSize: 18, color: '#ff4d4f' }}
                                    />
                                </Col>
                                <Col xs={12} sm={6}>
                                    <Statistic
                                        title="Salvage Value"
                                        value={item.financials.salvageValue || 0}
                                        prefix="Rs."
                                        valueStyle={{ fontSize: 18 }}
                                    />
                                </Col>
                            </Row>
                            <Divider />
                            <Descriptions column={{ xs: 1, sm: 3 }} size="small">
                                <Descriptions.Item label="Depreciation Method">
                                    {item.financials.depreciationMethod?.replace('-', ' ').toUpperCase() || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Useful Life">
                                    {item.financials.usefulLife ? `${item.financials.usefulLife} years` : '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Depreciation Rate">
                                    {item.financials.depreciationRate ? `${item.financials.depreciationRate}%` : '-'}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    )}

                    {/* Location */}
                    <Card
                        title={<><EnvironmentOutlined /> Location</>}
                        style={{ borderRadius: 12, marginBottom: 16 }}
                    >
                        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                            <Descriptions.Item label="Building">{item.location?.building || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Floor">{item.location?.floor || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Room">{item.location?.roomName || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Shelf/Rack">{item.location?.shelf || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Area" span={2}>{item.location?.area || '-'}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                {/* Side Panel */}
                <Col xs={24} lg={8}>
                    {/* Quick Actions */}
                    <Card title="Quick Actions" style={{ borderRadius: 12, marginBottom: 16 }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {item.status === 'available' && (
                                <Button
                                    type="primary"
                                    icon={<UserOutlined />}
                                    block
                                    onClick={() => setAssignModal(true)}
                                >
                                    Assign / Check Out
                                </Button>
                            )}
                            {item.allocation?.isAllocated && (
                                <Button
                                    icon={<UndoOutlined />}
                                    block
                                    onClick={() => setReturnModal(true)}
                                >
                                    Return Item
                                </Button>
                            )}
                            <Button
                                icon={<ToolOutlined />}
                                block
                                onClick={() => setMaintenanceModal(true)}
                                disabled={item.status === 'under-maintenance'}
                            >
                                Schedule Maintenance
                            </Button>
                            {item.status === 'under-maintenance' && (
                                <Button
                                    type="primary"
                                    icon={<CheckCircleOutlined />}
                                    block
                                    onClick={() => setCompleteMaintenanceModal(true)}
                                    style={{ backgroundColor: '#52c41a' }}
                                >
                                    Complete Maintenance
                                </Button>
                            )}
                            <Button
                                icon={<SwapOutlined />}
                                block
                                disabled={item.allocation?.isAllocated}
                                onClick={() => setTransferModal(true)}
                            >
                                Transfer to Branch
                            </Button>
                            <Button
                                icon={<HistoryOutlined />}
                                block
                                onClick={() => setHistoryModal(true)}
                            >
                                Transaction History
                            </Button>
                        </Space>
                    </Card>

                    {/* Warranty Information */}
                    <Card
                        title={<><SafetyCertificateOutlined /> Warranty</>}
                        style={{ borderRadius: 12, marginBottom: 16 }}
                    >
                        {item.warranty?.hasWarranty ? (
                            <>
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Provider">{item.warranty.warrantyProvider || '-'}</Descriptions.Item>
                                    <Descriptions.Item label="Start Date">
                                        {item.warranty.warrantyStartDate ? dayjs(item.warranty.warrantyStartDate).format('DD MMM YYYY') : '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="End Date">
                                        {item.warranty.warrantyEndDate ? dayjs(item.warranty.warrantyEndDate).format('DD MMM YYYY') : '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Status">
                                        {item.warranty.warrantyEndDate && dayjs(item.warranty.warrantyEndDate).isAfter(dayjs()) ? (
                                            <Tag color="success">Active</Tag>
                                        ) : (
                                            <Tag color="error">Expired</Tag>
                                        )}
                                    </Descriptions.Item>
                                </Descriptions>
                                {item.warranty.warrantyContact && (
                                    <div style={{ marginTop: 8 }}>
                                        <Text type="secondary">Contact: {item.warranty.warrantyContact}</Text>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Empty description="No warranty information" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </Card>

                    {/* Assignment Information */}
                    {item.allocation?.isAllocated && (
                        <Card
                            title={<><UserOutlined /> Current Assignment</>}
                            style={{ borderRadius: 12, marginBottom: 16 }}
                        >
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Assigned To">
                                    {item.allocation.student?.fullName || item.allocation.staff?.fullName || item.allocation.department || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Type">{item.allocation.allocationType || '-'}</Descriptions.Item>
                                <Descriptions.Item label="Date">
                                    {item.allocation.allocatedDate ? dayjs(item.allocation.allocatedDate).format('DD MMM YYYY') : '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Purpose">{item.allocation.purpose || '-'}</Descriptions.Item>
                            </Descriptions>
                        </Card>
                    )}

                    {/* Maintenance Schedule */}
                    <Card
                        title={<><ToolOutlined /> Maintenance</>}
                        style={{ borderRadius: 12, marginBottom: 16 }}
                    >
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Last Maintenance">
                                {item.maintenance?.lastMaintenanceDate
                                    ? dayjs(item.maintenance.lastMaintenanceDate).format('DD MMM YYYY')
                                    : 'Never'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Next Due">
                                {item.maintenance?.nextMaintenanceDate
                                    ? dayjs(item.maintenance.nextMaintenanceDate).format('DD MMM YYYY')
                                    : 'Not scheduled'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Frequency">
                                {item.maintenance?.maintenanceFrequency?.replace('-', ' ') || '-'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                        <Card title="Tags" style={{ borderRadius: 12, marginBottom: 16 }}>
                            <Space wrap>
                                {item.tags.map((tag, index) => (
                                    <Tag key={index} color="blue">{tag}</Tag>
                                ))}
                            </Space>
                        </Card>
                    )}
                </Col>
            </Row>

            {/* History Sections */}
            {
                item.maintenanceHistory && item.maintenanceHistory.length > 0 && (
                    <Card
                        title={<><HistoryOutlined /> Maintenance History</>}
                        style={{ borderRadius: 12, marginTop: 16 }}
                    >
                        <Timeline
                            items={item.maintenanceHistory.slice(0, 5).map((record, index) => ({
                                color: record.status === 'completed' ? 'green' : 'blue',
                                children: (
                                    <div key={index}>
                                        <Text strong>{record.type?.toUpperCase()}</Text>
                                        <Text type="secondary" style={{ marginLeft: 8 }}>
                                            {dayjs(record.date).format('DD MMM YYYY')}
                                        </Text>
                                        {record.description && <div><Text>{record.description}</Text></div>}
                                        {record.actualCost && <div><Text type="secondary">Cost: Rs. {record.actualCost.toLocaleString()}</Text></div>}
                                    </div>
                                ),
                            }))}
                        />
                    </Card>
                )
            }

            {/* Transfer Modal */}
            <Modal
                title="Transfer Item"
                open={transferModal}
                onCancel={() => setTransferModal(false)}
                footer={null}
            >
                <Form layout="vertical" onFinish={handleTransfer}>
                    <Form.Item
                        name="toBranch"
                        label="Destination Branch"
                        rules={[{ required: true, message: 'Please select a branch' }]}
                    >
                        <Select placeholder="Select branch">
                            {/* In a real app, fetch branches. For now using mock or just text input might be safer if branches API unknown */}
                            {/* Assuming branches are available via some context or API. Using Input for now to be safe or Select if I can fetch. */}
                            {/* Better to use Input for Branch ID/Name if we don't have branches loaded */}
                        </Select>
                    </Form.Item>
                    <Form.Item name="notes" label="Notes">
                        <Input.TextArea />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Confirm Transfer
                    </Button>
                </Form>
            </Modal>

            {/* Maintenance Modal */}
            <Modal
                title="Schedule Maintenance"
                open={maintenanceModal}
                onCancel={() => setMaintenanceModal(false)}
                footer={null}
            >
                <Form layout="vertical" onFinish={handleMaintenance}>
                    <Form.Item
                        name="type"
                        label="Maintenance Type"
                        rules={[{ required: true }]}
                        initialValue="preventive"
                    >
                        <Select>
                            <Select.Option value="preventive">Preventive</Select.Option>
                            <Select.Option value="corrective">Corrective</Select.Option>
                            <Select.Option value="upgrade">Upgrade</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="scheduledDate"
                        label="Scheduled Date"
                        rules={[{ required: true }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="provider" label="Service Provider">
                        <Input />
                    </Form.Item>
                    <Form.Item name="cost" label="Estimated Cost">
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Schedule
                    </Button>
                </Form>
            </Modal>

            {/* History Modal */}
            <Modal
                title="Transaction History"
                open={historyModal}
                onCancel={() => setHistoryModal(false)}
                footer={null}
                width={800}
            >
                <Tabs defaultActiveKey="1">
                    <Tabs.TabPane tab="Assignment History" key="1">
                        <DataTable
                            dataSource={item.allocationHistory || []}
                            columns={[
                                { title: 'Date', dataIndex: 'allocatedDate', render: d => d ? dayjs(d).format('DD/MM/YYYY') : '-' },
                                { title: 'Type', dataIndex: 'allocationType' },
                                { title: 'Assigned To', dataIndex: 'allocatedTo', render: (val, row) => row.allocatedTo?.name || val }, // simplified
                                { title: 'Assigned By', dataIndex: 'allocatedBy', render: (val, row) => row.allocatedTo?.name || val }, // simplified
                                { title: 'Purpose', dataIndex: 'purpose' },
                                { title: 'Returned', dataIndex: 'returnedDate', render: d => d ? dayjs(d).format('DD/MM/YYYY') : 'Active' },
                            ]}
                            pagination={false}
                        />
                    </Tabs.TabPane>
                    {/* Add Stock History if available */}
                </Tabs>
            </Modal>
            {/* Assign Modal */}
            <Modal
                title="Assign Item"
                open={assignModal}
                onCancel={() => setAssignModal(false)}
                footer={null}
            >
                <Form layout="vertical" onFinish={handleAssign} initialValues={{ allocationType: 'staff' }}>
                    <Form.Item name="allocationType" label="Allocation Type" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="staff">Staff</Select.Option>
                            <Select.Option value="student">Student</Select.Option>
                            <Select.Option value="department">Department</Select.Option>
                            <Select.Option value="room">Room / Class</Select.Option>
                            <Select.Option value="project">Project</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item noStyle dependencies={['allocationType']}>
                        {({ getFieldValue }) => {
                            const type = getFieldValue('allocationType');
                            if (type === 'staff') {
                                return (
                                    <Form.Item name="staffId" label="Staff ID/Name" rules={[{ required: true }]}>
                                        <Input placeholder="Enter Staff ID or Name" />
                                    </Form.Item>
                                );
                            }
                            if (type === 'student') {
                                return (
                                    <Form.Item name="studentId" label="Student ID/Name" rules={[{ required: true }]}>
                                        <Input placeholder="Enter Student ID or Name" />
                                    </Form.Item>
                                );
                            }
                            if (type === 'department') {
                                return (
                                    <Form.Item name="department" label="Department Name" rules={[{ required: true }]}>
                                        <Input placeholder="Enter Department (e.g. Science)" />
                                    </Form.Item>
                                );
                            }
                            if (type === 'room') {
                                return (
                                    <Form.Item name="room" label="Room / Class Name" rules={[{ required: true }]}>
                                        <Input placeholder="Enter Room (e.g. 101 or Class 5A)" />
                                    </Form.Item>
                                );
                            }
                            if (type === 'project') {
                                return (
                                    <Form.Item name="project" label="Project Name" rules={[{ required: true }]}>
                                        <Input placeholder="Enter Project Name" />
                                    </Form.Item>
                                );
                            }
                            return null;
                        }}
                    </Form.Item>

                    <Form.Item name="purpose" label="Purpose">
                        <Input placeholder="Reason for assignment" />
                    </Form.Item>
                    <Form.Item name="expectedReturnDate" label="Expected Return Date">
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block>
                        Confirm Assignment
                    </Button>
                </Form>
            </Modal>

            {/* Return Modal */}
            <Modal
                title="Return Item"
                open={returnModal}
                onCancel={() => setReturnModal(false)}
                footer={null}
            >
                <Form layout="vertical" onFinish={handleReturn} initialValues={{ condition: item?.condition || 'good' }}>
                    <Form.Item name="condition" label="Returned Condition" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="new">New</Select.Option>
                            <Select.Option value="excellent">Excellent</Select.Option>
                            <Select.Option value="good">Good</Select.Option>
                            <Select.Option value="fair">Fair</Select.Option>
                            <Select.Option value="poor">Poor</Select.Option>
                            <Select.Option value="damaged">Damaged</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="notes" label="Notes / Remarks">
                        <Input.TextArea rows={3} placeholder="Any damage or issues noted?" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Confirm Return
                    </Button>
                </Form>
            </Modal>

            {/* Complete Maintenance Modal */}
            <Modal
                title="Complete Maintenance"
                open={completeMaintenanceModal}
                onCancel={() => setCompleteMaintenanceModal(false)}
                footer={null}
            >
                <Form layout="vertical" onFinish={handleCompleteMaintenance} initialValues={{ actualCost: 0, status: 'available' }}>
                    <Form.Item name="completedDate" label="Completion Date" rules={[{ required: true }]} initialValue={dayjs()}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="actualCost" label="Final Cost">
                        <InputNumber style={{ width: '100%' }} min={0} prefix="Rs." />
                    </Form.Item>
                    <Form.Item name="description" label="Repairs Done / Remarks">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Confirm Completion
                    </Button>
                </Form>
            </Modal>
        </div >
    );
}
