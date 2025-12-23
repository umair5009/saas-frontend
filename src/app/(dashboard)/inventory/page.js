'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Typography,
  Statistic,
  Tabs,
  Avatar,
  Progress,
  Dropdown,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Badge,
  Alert,
  Tooltip,
  Empty,
  Spin,
  Popconfirm,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  WarningOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SyncOutlined,
  ToolOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { inventoryApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

// Status and condition configurations
const STATUS_CONFIG = {
  'available': { color: 'success', text: 'Available', icon: <CheckCircleOutlined /> },
  'in-use': { color: 'processing', text: 'In Use', icon: <ClockCircleOutlined /> },
  'allocated': { color: 'processing', text: 'Allocated', icon: <ClockCircleOutlined /> },
  'under-maintenance': { color: 'warning', text: 'Under Maintenance', icon: <ToolOutlined /> },
  'under-repair': { color: 'warning', text: 'Under Repair', icon: <ToolOutlined /> },
  'disposed': { color: 'default', text: 'Disposed', icon: <DeleteOutlined /> },
  'lost': { color: 'error', text: 'Lost', icon: <ExclamationCircleOutlined /> },
  'stolen': { color: 'error', text: 'Stolen', icon: <ExclamationCircleOutlined /> },
  'reserved': { color: 'purple', text: 'Reserved', icon: <ClockCircleOutlined /> },
  'in-transit': { color: 'cyan', text: 'In Transit', icon: <SwapOutlined /> },
};

const CONDITION_CONFIG = {
  'new': { color: '#52c41a', text: 'New' },
  'excellent': { color: '#1890ff', text: 'Excellent' },
  'good': { color: '#13c2c2', text: 'Good' },
  'fair': { color: '#faad14', text: 'Fair' },
  'poor': { color: '#fa8c16', text: 'Poor' },
  'damaged': { color: '#ff4d4f', text: 'Damaged' },
  'non-functional': { color: '#8c8c8c', text: 'Non-Functional' },
};

const TYPE_CONFIG = {
  'fixed-asset': { color: '#1890ff', text: 'Fixed Asset' },
  'consumable': { color: '#52c41a', text: 'Consumable' },
  'equipment': { color: '#722ed1', text: 'Equipment' },
  'furniture': { color: '#eb2f96', text: 'Furniture' },
  'vehicle': { color: '#fa8c16', text: 'Vehicle' },
  'it-equipment': { color: '#13c2c2', text: 'IT Equipment' },
  'other': { color: '#8c8c8c', text: 'Other' },
};

export default function InventoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('items');
  const [items, setItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [maintenanceDueItems, setMaintenanceDueItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({});

  // Modal states
  const [stockModal, setStockModal] = useState({ open: false, item: null, type: 'add' });
  const [transferModal, setTransferModal] = useState({ open: false, item: null });
  const [maintenanceModal, setMaintenanceModal] = useState({ open: false, item: null });
  const [historyModal, setHistoryModal] = useState({ open: false, item: null });
  const [detailModal, setDetailModal] = useState({ open: false, item: null });
  const [stockForm] = Form.useForm();

  // Fetch items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      };

      const response = await inventoryApi.getItems(params);
      if (response?.success) {
        setItems(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response?.pagination?.total || response?.pagination?.length || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      message.error('Failed to fetch inventory items');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters]);

  // Fetch summary stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await inventoryApi.getSummary();
      if (response?.sucess) {
        setStats(response.data?.summary || {});
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats on error
      setStats({
        totalItems: 0,
        totalQuantity: 0,
        totalValue: 0,
        availableItems: 0,
        inUseItems: 0,
        underMaintenanceItems: 0,
      });
    }
  }, []);

  // Fetch low stock items
  const fetchLowStock = useCallback(async () => {
    try {
      const response = await inventoryApi.getLowStock();
      if (response?.success) {
        setLowStockItems(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching low stock items:', error);
    }
  }, []);

  // Fetch maintenance due items
  const fetchMaintenanceDue = useCallback(async () => {
    try {
      const response = await inventoryApi.getMaintenanceDue({ days: 30 });
      if (response.success) {
        setMaintenanceDueItems(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching maintenance due items:', error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchItems();
    fetchStats();
    fetchLowStock();
    fetchMaintenanceDue();
  }, []);

  // Refetch when pagination or filters change
  useEffect(() => {
    fetchItems();
  }, [pagination.current, pagination.pageSize, filters]);

  // Handle stock update
  const handleStockUpdate = async (values) => {
    try {
      const data = {
        quantity: values.quantity,
        type: stockModal.type === 'add' ? 'add' : 'remove',
        reason: values.reason,
      };

      await inventoryApi.updateStock(stockModal.item._id, data);
      message.success(`Stock ${stockModal.type === 'add' ? 'added' : 'removed'} successfully!`);
      setStockModal({ open: false, item: null, type: 'add' });
      stockForm.resetFields();
      fetchItems();
      fetchStats();
      fetchLowStock();
    } catch (error) {
      console.error('Error updating stock:', error);
      message.error(error.response?.data?.message || 'Failed to update stock');
    }
  };

  // Handle delete item
  const handleDeleteItem = async (id) => {
    try {
      await inventoryApi.deleteItem(id);
      message.success('Item deleted successfully!');
      fetchItems();
      fetchStats();
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error(error.response?.data?.message || 'Failed to delete item');
    }
  };


  // Handle transfer
  const handleTransfer = async (values) => {
    try {
      await inventoryApi.transferItem(transferModal.item._id, values);
      message.success('Item transferred successfully');
      setTransferModal({ open: false, item: null });
      fetchItems();
    } catch (error) {
      console.error('Error transferring item:', error);
      message.error(error.response?.data?.message || 'Failed to transfer item');
    }
  };

  // Handle maintenance
  const handleMaintenance = async (values) => {
    try {
      await inventoryApi.scheduleMaintenance(maintenanceModal.item._id, {
        ...values,
        scheduledDate: values.scheduledDate.format('YYYY-MM-DD')
      });
      message.success('Maintenance scheduled successfully');
      setMaintenanceModal({ open: false, item: null });
      fetchItems();
      fetchMaintenanceDue();
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      message.error(error.response?.data?.message || 'Failed to schedule maintenance');
    }
  };

  // Handle table change
  const handleTableChange = (newPagination, tableFilters, sorter) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  // Handle search
  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Render status tag
  const renderStatusTag = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG['available'];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // Render condition tag
  const renderConditionTag = (condition) => {
    const config = CONDITION_CONFIG[condition] || CONDITION_CONFIG['good'];
    return (
      <Tag color={config.color}>{config.text}</Tag>
    );
  };

  // Render type tag
  const renderTypeTag = (type) => {
    const config = TYPE_CONFIG[type] || TYPE_CONFIG['other'];
    return (
      <Tag color={config.color}>{config.text}</Tag>
    );
  };

  // Table columns for items
  const itemColumns = [
    {
      title: 'Item',
      key: 'item',
      width: 300,
      fixed: 'left',
      render: (_, record) => (
        <Space>
          <Avatar
            shape="square"
            size={48}
            style={{
              background: record.status === 'disposed'
                ? 'linear-gradient(135deg, #f5f5f5 0%, #d9d9d9 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            icon={<InboxOutlined style={{ fontSize: 20 }} />}
          />
          <div>
            <Text strong style={{ display: 'block', marginBottom: 2 }}>{record.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.assetTag || 'No Tag'} • {record.category?.name || record.subcategory || 'Uncategorized'}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => renderTypeTag(type),
      filters: Object.entries(TYPE_CONFIG).map(([key, val]) => ({ text: val.text, value: key })),
    },
    {
      title: 'Quantity',
      key: 'quantity',
      width: 150,
      render: (_, record) => {
        const quantity = record.quantity || 1;
        const reorderLevel = record.reorderLevel || 10;
        const maxStock = reorderLevel * 3;
        const percentage = Math.min((quantity / maxStock) * 100, 100);

        return (
          <div>
            <div style={{ marginBottom: 4 }}>
              <Text strong style={{ fontSize: 16 }}>{quantity}</Text>
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>{record.unit || 'pcs'}</Text>
            </div>
            {record.isConsumable && (
              <>
                <Progress
                  percent={percentage}
                  size="small"
                  strokeColor={
                    quantity <= reorderLevel * 0.5
                      ? '#ff4d4f'
                      : quantity <= reorderLevel
                        ? '#faad14'
                        : '#52c41a'
                  }
                  showInfo={false}
                />
                {quantity <= reorderLevel && (
                  <Text type="danger" style={{ fontSize: 11 }}>
                    <WarningOutlined /> Low Stock
                  </Text>
                )}
              </>
            )}
          </div>
        );
      },
    },
    {
      title: 'Value',
      key: 'value',
      width: 130,
      render: (_, record) => {
        const value = record.financials?.currentValue || record.purchase?.purchasePrice || 0;
        return (
          <Tooltip title={`Original: Rs. ${(record.financials?.originalValue || record.purchase?.purchasePrice || 0).toLocaleString()}`}>
            <Text strong style={{ color: '#1890ff' }}>
              Rs. {value.toLocaleString()}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: 'Assigned To',
      key: 'assignedTo',
      width: 150,
      render: (_, record) => {
        const allocation = record.allocation;
        if (!allocation?.isAllocated) return '-';
        return (
          <Text type="secondary">
            {allocation.student?.fullName || allocation.staff?.fullName || allocation.department || allocation.room || allocation.project || '-'}
          </Text>
        );
      },
    },
    {
      title: 'Location',
      key: 'location',
      width: 150,
      render: (_, record) => (
        <Text type="secondary">
          {record.location?.roomName || record.location?.building || record.location?.area || 'Not assigned'}
        </Text>
      ),
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
      width: 100,
      render: (condition) => renderConditionTag(condition),
      filters: Object.entries(CONDITION_CONFIG).map(([key, val]) => ({ text: val.text, value: key })),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => renderStatusTag(status),
      filters: Object.entries(STATUS_CONFIG).map(([key, val]) => ({ text: val.text, value: key })),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {record.isConsumable && (
            <>
              <Tooltip title="Add Stock">
                <Button
                  type="primary"
                  size="small"
                  icon={<ArrowUpOutlined />}
                  onClick={() => setStockModal({ open: true, item: record, type: 'add' })}
                />
              </Tooltip>
              <Tooltip title="Remove Stock">
                <Button
                  size="small"
                  icon={<ArrowDownOutlined />}
                  onClick={() => setStockModal({ open: true, item: record, type: 'remove' })}
                />
              </Tooltip>
            </>
          )}
          <Dropdown
            menu={{
              items: [
                {
                  key: 'view',
                  icon: <EyeOutlined />,
                  label: 'View Details',
                  onClick: () => router.push(`/inventory/items/${record._id}`),
                },
                {
                  key: 'edit',
                  icon: <EditOutlined />,
                  label: 'Edit',
                  onClick: () => router.push(`/inventory/items/${record._id}/edit`),
                },
                {
                  key: 'history',
                  icon: <SyncOutlined />,
                  label: 'Transaction History',
                  onClick: () => setHistoryModal({ open: true, item: record }),
                },
                { type: 'divider' },
                {
                  key: 'maintenance',
                  icon: <ToolOutlined />,
                  label: 'Schedule Maintenance',
                  onClick: () => setMaintenanceModal({ open: true, item: record }),
                },
                {
                  key: 'transfer',
                  icon: <SwapOutlined />,
                  label: 'Transfer',
                  disabled: record.allocation?.isAllocated,
                  onClick: () => setTransferModal({ open: true, item: record }),
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: 'Delete',
                  danger: true,
                  onClick: () => {
                    Modal.confirm({
                      title: 'Delete Item',
                      content: `Are you sure you want to delete "${record.name}"?`,
                      okText: 'Delete',
                      okType: 'danger',
                      cancelText: 'Cancel',
                      onOk: () => handleDeleteItem(record._id),
                    });
                  },
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // Low stock columns
  const lowStockColumns = [
    {
      title: 'Item',
      key: 'item',
      render: (_, record) => (
        <Space>
          <Avatar
            shape="square"
            size={40}
            style={{ background: '#fff2e8', color: '#fa541c' }}
            icon={<WarningOutlined />}
          />
          <div>
            <Text strong>{record.itemName || record.name}</Text>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {record.assetCode || record.assetTag}
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
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty, record) => (
        <Text type="danger" strong>
          {qty} / {record.minimumStock || record.reorderLevel || '?'}
        </Text>
      ),
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      render: (unit) => unit || 'pcs',
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

  // Maintenance due columns
  const maintenanceColumns = [
    {
      title: 'Item',
      key: 'item',
      render: (_, record) => (
        <Space>
          <Avatar
            shape="square"
            size={40}
            style={{ background: '#fff7e6', color: '#fa8c16' }}
            icon={<ToolOutlined />}
          />
          <div>
            <Text strong>{record.itemName || record.name}</Text>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {record.assetCode || record.assetTag}
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
      title: 'Last Maintenance',
      dataIndex: 'lastMaintenanceDate',
      key: 'lastMaintenanceDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Never',
    },
    {
      title: 'Next Due',
      dataIndex: 'nextMaintenanceDate',
      key: 'nextMaintenanceDate',
      render: (date) => {
        if (!date) return 'Not scheduled';
        const dueDate = new Date(date);
        const today = new Date();
        const isOverdue = dueDate < today;
        return (
          <Text type={isOverdue ? 'danger' : 'warning'}>
            {dueDate.toLocaleDateString()}
            {isOverdue && ' (Overdue)'}
          </Text>
        );
      },
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
      render: (condition) => renderConditionTag(condition),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<ToolOutlined />}
        >
          Schedule
        </Button>
      ),
    },
  ];

  // Tab items configuration
  const tabItems = [
    {
      key: 'items',
      label: (
        <span>
          <InboxOutlined /> All Items
        </span>
      ),
      children: (
        <DataTable
          columns={itemColumns}
          dataSource={items}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          onRefresh={() => {
            fetchItems();
            fetchStats();
          }}
          searchPlaceholder="Search by name, asset tag, category..."
          onSearch={handleSearch}
          showExport
          scroll={{ x: 1300 }}
          rowKey="_id"
        />
      ),
    },
    {
      key: 'low-stock',
      label: (
        <Badge count={lowStockItems.length} size="small" offset={[10, 0]}>
          <span>
            <WarningOutlined /> Low Stock
          </span>
        </Badge>
      ),
      children: (
        <>
          {lowStockItems.length > 0 && (
            <Alert
              message={`${lowStockItems.length} items need restocking`}
              description="These items have fallen below their minimum stock levels and should be reordered soon."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              action={
                <Button
                  size="small"
                  type="primary"
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
            onRefresh={fetchLowStock}
            rowKey="_id"
            pagination={false}
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
      key: 'maintenance',
      label: (
        <Badge count={maintenanceDueItems.length} size="small" offset={[10, 0]}>
          <span>
            <ToolOutlined /> Maintenance Due
          </span>
        </Badge>
      ),
      children: (
        <>
          {maintenanceDueItems.length > 0 && (
            <Alert
              message={`${maintenanceDueItems.length} items need maintenance`}
              description="These items are due for maintenance within the next 30 days."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          <DataTable
            columns={maintenanceColumns}
            dataSource={maintenanceDueItems}
            loading={loading}
            onRefresh={fetchMaintenanceDue}
            rowKey="_id"
            pagination={false}
          />
          {maintenanceDueItems.length === 0 && !loading && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No maintenance due"
            />
          )}
        </>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Inventory Management"
        subtitle="Track and manage school assets, equipment, and supplies"
        breadcrumbs={[{ title: 'Inventory' }]}
        actions={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchItems();
                fetchStats();
                fetchLowStock();
                fetchMaintenanceDue();
              }}
            >
              Refresh
            </Button>
            <Button
              icon={<AppstoreOutlined />}
              onClick={() => router.push('/inventory/categories')}
            >
              Categories
            </Button>
            <Button
              icon={<BarChartOutlined />}
              onClick={() => router.push('/inventory/stock')}
            >
              Stock Management
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/inventory/items/create')}
            >
              Add Item
            </Button>
          </Space>
        }
      />

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} md={4}>
          <Card
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Total Items</Text>}
              value={stats.totalItems || items.length || 0}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Total Value</Text>}
              value={stats.totalValue || 0}
              prefix="Rs."
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Low Stock</Text>}
              value={lowStockItems.length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Available</Text>}
              value={stats.availableItems || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #fa8c16 0%, #fa541c 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>In Use</Text>}
              value={stats.inUseItems || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
              border: 'none',
            }}
          >
            <Statistic
              title={<Text style={{ color: 'rgba(255,255,255,0.85)' }}>Maintenance Due</Text>}
              value={maintenanceDueItems.length}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Card style={{ borderRadius: 12 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      {/* Stock Update Modal */}
      <Modal
        title={
          <Space>
            {stockModal.type === 'add' ? <ArrowUpOutlined style={{ color: '#52c41a' }} /> : <ArrowDownOutlined style={{ color: '#ff4d4f' }} />}
            {`${stockModal.type === 'add' ? 'Add' : 'Remove'} Stock - ${stockModal.item?.name || stockModal.item?.itemName}`}
          </Space>
        }
        open={stockModal.open}
        onCancel={() => {
          setStockModal({ open: false, item: null, type: 'add' });
          stockForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <div style={{ marginBottom: 16, padding: 12, borderRadius: 8 }}>
          <Text type="secondary">Current Stock: </Text>
          <Text strong>{stockModal.item?.quantity || 0} {stockModal.item?.unit || 'pcs'}</Text>
        </div>

        <Form form={stockForm} layout="vertical" onFinish={handleStockUpdate}>
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
              placeholder={`Enter ${stockModal.item?.unit || 'quantity'} to ${stockModal.type}`}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true, message: 'Please provide a reason' }]}
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
                  <Option value="issued">Issued to Staff/Student</Option>
                  <Option value="consumed">Consumed</Option>
                  <Option value="damaged">Damaged/Expired</Option>
                  <Option value="transfer-out">Transfer Out</Option>
                  <Option value="adjustment">Inventory Adjustment</Option>
                  <Option value="other">Other</Option>
                </>
              )}
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Notes (Optional)">
            <Input.TextArea rows={2} placeholder="Additional notes..." />
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

      {/* Transfer Modal */}
      <Modal
        title="Transfer Item"
        open={transferModal.open}
        onCancel={() => setTransferModal({ open: false, item: null })}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={handleTransfer}>
          <Form.Item
            name="toBranch"
            label="Destination Branch"
            rules={[{ required: true, message: 'Please select a branch' }]}
          >
            <Select placeholder="Select branch">
              <Option value="branch-a">Main Branch</Option>
              <Option value="branch-b">Secondary Branch</Option>
              {/* Replace with real branch fetch if available */}
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
        open={maintenanceModal.open}
        onCancel={() => setMaintenanceModal({ open: false, item: null })}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={handleMaintenance}>
          <Form.Item
            name="type"
            label="Maintenance Type"
            rules={[{ required: true }]}
            initialValue="preventive"
          >
            <Select>
              <Option value="preventive">Preventive</Option>
              <Option value="corrective">Corrective</Option>
              <Option value="upgrade">Upgrade</Option>
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
        title={`History - ${historyModal.item?.name || 'Item'}`}
        open={historyModal.open}
        onCancel={() => setHistoryModal({ open: false, item: null })}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Tabs defaultActiveKey="1" items={[
          {
            key: '1',
            label: 'Assignment History',
            children: (
              <DataTable
                dataSource={historyModal.item?.allocationHistory || []}
                columns={[
                  { title: 'Date', dataIndex: 'allocatedDate', render: d => d ? dayjs(d).format('DD/MM/YYYY') : '-' },
                  { title: 'Type', dataIndex: 'allocationType' },
                  { title: 'Assigned To', dataIndex: 'allocatedTo', render: (val, row) => row.allocatedTo?.name || val }, // simplified
                  { title: 'Assigned By', dataIndex: 'allocatedBy', render: (val, row) => row.allocatedBy?.name || val }, // simplified
                  { title: 'Purpose', dataIndex: 'purpose' },
                  { title: 'Returned', dataIndex: 'returnedDate', render: d => d ? dayjs(d).format('DD/MM/YYYY') : 'Active' },
                ]}
                pagination={false}
                rowKey={(r, i) => i}
              />
            )
          }
        ]} />
      </Modal>
    </div>
  );

}