'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    Row,
    Col,
    Button,
    Space,
    Typography,
    Statistic,
    Table,
    Tag,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    message,
    Alert,
    Empty,
    Tabs,
    Progress,
    Avatar,
    Badge,
} from 'antd';
import {
    ArrowUpOutlined,
    ArrowDownOutlined,
    WarningOutlined,
    InboxOutlined,
    SyncOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    HistoryOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { inventoryApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export default function StockManagementPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('low-stock');
    const [lowStockItems, setLowStockItems] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});

    // Modal state
    const [stockModal, setStockModal] = useState({ open: false, item: null, type: 'add' });
    const [form] = Form.useForm();

    // Fetch low stock items
    const fetchLowStock = useCallback(async () => {
        try {
            const response = await inventoryApi.getLowStock();
            if (response?.success) {
                setLowStockItems(response?.data || []);
            }
        } catch (error) {
            console.error('Error fetching low stock:', error);
        }
    }, []);

    // Fetch all consumable items
    const fetchAllItems = useCallback(async () => {
        try {
            const response = await inventoryApi.getItems({ type: 'consumable' });
            if (response?.success) {
                setAllItems(response?.data || []);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    }, []);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            const response = await inventoryApi.getSummary();
            if (response?.success) {
                setStats(response?.data?.summary || {});
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);

    // Fetch all data
    const fetchAllData = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchLowStock(), fetchAllItems(), fetchStats()]);
        setLoading(false);
    }, [fetchLowStock, fetchAllItems, fetchStats]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // Handle stock update
    const handleStockUpdate = async (values) => {
        try {
            const data = {
                quantity: values.quantity,
                type: stockModal.type === 'add' ? 'add' : 'remove',
                reason: values.reason,
                reference: values.reference,
            };

            await inventoryApi.updateStock(stockModal.item._id, data);
            message.success(`Stock ${stockModal.type === 'add' ? 'added' : 'removed'} successfully!`);
            setStockModal({ open: false, item: null, type: 'add' });
            form.resetFields();
            fetchAllData();
        } catch (error) {
            console.error('Error updating stock:', error);
            message.error(error.response?.data?.message || 'Failed to update stock');
        }
    };

    // Low stock columns
    const lowStockColumns = [
        {
            title: 'Item',
            key: 'item',
            width: 280,
            render: (_, record) => (
                <Space>
                    <Avatar
                        shape="square"
                        size={44}
                        style={{
                            background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
                        }}
                        icon={<WarningOutlined />}
                    />
                    <div>
                        <Text strong>{record.itemName || record.name}</Text>
                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {record.assetCode || record.assetTag}
                            </Text>
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (cat) => cat?.name || cat || 'Uncategorized',
        },
        {
            title: 'Current Stock',
            key: 'stock',
            render: (_, record) => {
                const current = record.quantity || 0;
                const minimum = record.minimumStock || record.reorderLevel || 10;
                const percentage = Math.min((current / (minimum * 2)) * 100, 100);

                return (
                    <div style={{ minWidth: 120 }}>
                        <div style={{ marginBottom: 4 }}>
                            <Text strong type="danger">{current}</Text>
                            <Text type="secondary"> / {minimum}</Text>
                        </div>
                        <Progress
                            percent={percentage}
                            size="small"
                            strokeColor={current <= minimum * 0.5 ? '#ff4d4f' : '#faad14'}
                            showInfo={false}
                        />
                    </div>
                );
            },
        },
        {
            title: 'Unit',
            dataIndex: 'unit',
            key: 'unit',
            render: (unit) => unit || 'pcs',
        },
        {
            title: 'Shortage',
            key: 'shortage',
            render: (_, record) => {
                const shortage = (record.minimumStock || record.reorderLevel || 10) - (record.quantity || 0);
                return shortage > 0 ? (
                    <Tag color="error">{shortage} {record.unit || 'units'}</Tag>
                ) : '-';
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<ArrowUpOutlined />}
                    onClick={() => setStockModal({ open: true, item: record, type: 'add' })}
                >
                    Restock
                </Button>
            ),
        },
    ];

    // All items columns
    const allItemsColumns = [
        {
            title: 'Item',
            key: 'item',
            width: 280,
            render: (_, record) => (
                <Space>
                    <Avatar
                        shape="square"
                        size={44}
                        style={{
                            background: record.quantity <= (record.reorderLevel || 10)
                                ? 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                        icon={<InboxOutlined />}
                    />
                    <div>
                        <Text strong>{record.name}</Text>
                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {record.assetTag}
                            </Text>
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Stock Level',
            key: 'stock',
            render: (_, record) => {
                const current = record.quantity || 0;
                const reorder = record.reorderLevel || 10;
                const max = reorder * 3;
                const percentage = Math.min((current / max) * 100, 100);
                const isLow = current <= reorder;

                return (
                    <div style={{ minWidth: 140 }}>
                        <div style={{ marginBottom: 4 }}>
                            <Text strong style={{ color: isLow ? '#ff4d4f' : '#52c41a' }}>{current}</Text>
                            <Text type="secondary"> {record.unit || 'pcs'}</Text>
                        </div>
                        <Progress
                            percent={percentage}
                            size="small"
                            strokeColor={isLow ? '#ff4d4f' : current <= reorder * 1.5 ? '#faad14' : '#52c41a'}
                            showInfo={false}
                        />
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                            Reorder at: {reorder}
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => {
                const isLow = (record.quantity || 0) <= (record.reorderLevel || 10);
                return isLow ? (
                    <Tag color="error" icon={<ExclamationCircleOutlined />}>Low Stock</Tag>
                ) : (
                    <Tag color="success" icon={<CheckCircleOutlined />}>In Stock</Tag>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 180,
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<ArrowUpOutlined />}
                        onClick={() => setStockModal({ open: true, item: record, type: 'add' })}
                    >
                        Add
                    </Button>
                    <Button
                        size="small"
                        icon={<ArrowDownOutlined />}
                        onClick={() => setStockModal({ open: true, item: record, type: 'remove' })}
                    >
                        Remove
                    </Button>
                </Space>
            ),
        },
    ];

    // Tab items
    const tabItems = [
        {
            key: 'low-stock',
            label: (
                <Badge count={lowStockItems.length} size="small" offset={[10, 0]}>
                    <span><WarningOutlined /> Low Stock Alerts</span>
                </Badge>
            ),
            children: (
                <>
                    {lowStockItems.length > 0 && (
                        <Alert
                            message={`${lowStockItems.length} items need restocking`}
                            description="These items have fallen below their minimum stock levels. Restock them to avoid shortages."
                            type="error"
                            showIcon
                            style={{ marginBottom: 16 }}
                            action={
                                <Button
                                    type="primary"
                                    size="small"
                                    onClick={() => router.push('/inventory/purchase-orders/create')}
                                >
                                    Create Purchase Order
                                </Button>
                            }
                        />
                    )}
                    <DataTable
                        columns={lowStockColumns}
                        dataSource={lowStockItems}
                        loading={loading}
                        rowKey="_id"
                        pagination={false}
                        onRefresh={fetchLowStock}
                    />
                    {lowStockItems.length === 0 && !loading && (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="All items are well stocked"
                        />
                    )}
                </>
            ),
        },
        {
            key: 'all-consumables',
            label: <span><InboxOutlined /> All Consumables</span>,
            children: (
                <DataTable
                    columns={allItemsColumns}
                    dataSource={allItems}
                    loading={loading}
                    rowKey="_id"
                    onRefresh={fetchAllItems}
                    searchPlaceholder="Search items..."
                />
            ),
        },
    ];

    return (
        <div className="fade-in">
            <PageHeader
                title="Stock Management"
                subtitle="Monitor and manage consumable inventory stock levels"
                breadcrumbs={[
                    { title: 'Inventory', path: '/inventory' },
                    { title: 'Stock Management' },
                ]}
                backButton
                actions={
                    <Button icon={<ReloadOutlined />} onClick={fetchAllData}>
                        Refresh
                    </Button>
                }
            />

            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
                        <Statistic
                            title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Total Consumables</Text>}
                            value={allItems.length}
                            prefix={<InboxOutlined />}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)', border: 'none' }}>
                        <Statistic
                            title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Low Stock Items</Text>}
                            value={lowStockItems.length}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', border: 'none' }}>
                        <Statistic
                            title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Well Stocked</Text>}
                            value={allItems.length - lowStockItems.length}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #fa8c16 0%, #fa541c 100%)', border: 'none' }}>
                        <Statistic
                            title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Critical</Text>}
                            value={lowStockItems.filter(i => (i.quantity || 0) <= ((i.minimumStock || i.reorderLevel || 10) * 0.5)).length}
                            prefix={<ExclamationCircleOutlined />}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Content */}
            <Card style={{ borderRadius: 12 }}>
                <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
            </Card>

            {/* Stock Update Modal */}
            <Modal
                title={
                    <Space>
                        {stockModal.type === 'add' ? (
                            <ArrowUpOutlined style={{ color: '#52c41a' }} />
                        ) : (
                            <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                        )}
                        {`${stockModal.type === 'add' ? 'Add' : 'Remove'} Stock - ${stockModal.item?.name || stockModal.item?.itemName}`}
                    </Space>
                }
                open={stockModal.open}
                onCancel={() => {
                    setStockModal({ open: false, item: null, type: 'add' });
                    form.resetFields();
                }}
                footer={null}
                destroyOnClose
            >
                <div style={{ marginBottom: 16, padding: 12, borderRadius: 8 }}>
                    <Text type="secondary">Current Stock: </Text>
                    <Text strong>{stockModal.item?.quantity || 0} {stockModal.item?.unit || 'pcs'}</Text>
                    {stockModal.item?.minimumStock || stockModal.item?.reorderLevel ? (
                        <>
                            <Text type="secondary" style={{ marginLeft: 16 }}>Min Level: </Text>
                            <Text>{stockModal.item?.minimumStock || stockModal.item?.reorderLevel}</Text>
                        </>
                    ) : null}
                </div>

                <Form form={form} layout="vertical" onFinish={handleStockUpdate}>
                    <Form.Item
                        name="quantity"
                        label="Quantity"
                        rules={[
                            { required: true, message: 'Please enter quantity' },
                            { type: 'number', min: 1, message: 'Quantity must be at least 1' },
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={1}
                            max={stockModal.type === 'remove' ? stockModal.item?.quantity : undefined}
                            placeholder={`Enter ${stockModal.item?.unit || 'quantity'}`}
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="reason"
                        label="Reason"
                        rules={[{ required: true, message: 'Please select a reason' }]}
                    >
                        <Select placeholder="Select reason" size="large">
                            {stockModal.type === 'add' ? (
                                <>
                                    <Option value="purchase">New Purchase</Option>
                                    <Option value="return">Item Return</Option>
                                    <Option value="transfer-in">Transfer In</Option>
                                    <Option value="adjustment">Inventory Adjustment</Option>
                                    <Option value="other">Other</Option>
                                </>
                            ) : (
                                <>
                                    <Option value="issued">Issued to Department</Option>
                                    <Option value="consumed">Consumed</Option>
                                    <Option value="damaged">Damaged/Expired</Option>
                                    <Option value="transfer-out">Transfer Out</Option>
                                    <Option value="adjustment">Inventory Adjustment</Option>
                                    <Option value="other">Other</Option>
                                </>
                            )}
                        </Select>
                    </Form.Item>

                    <Form.Item name="reference" label="Reference/Notes">
                        <Input.TextArea rows={2} placeholder="Invoice number, recipient, or other details" />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setStockModal({ open: false, item: null, type: 'add' })}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                danger={stockModal.type === 'remove'}
                                icon={stockModal.type === 'add' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            >
                                {stockModal.type === 'add' ? 'Add Stock' : 'Remove Stock'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
