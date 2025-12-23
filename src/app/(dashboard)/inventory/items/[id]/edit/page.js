'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
    DatePicker,
    message,
    Divider,
    Typography,
    Switch,
    Spin,
} from 'antd';
import {
    SaveOutlined,
    InboxOutlined,
    CalculatorOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { inventoryApi } from '@/lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Asset types and conditions
const ASSET_TYPES = [
    { value: 'fixed-asset', label: 'Fixed Asset' },
    { value: 'consumable', label: 'Consumable' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'vehicle', label: 'Vehicle' },
    { value: 'it-equipment', label: 'IT Equipment' },
    { value: 'other', label: 'Other' },
];

const CONDITIONS = [
    { value: 'new', label: 'New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
    { value: 'damaged', label: 'Damaged' },
];

const STATUSES = [
    { value: 'available', label: 'Available' },
    { value: 'in-use', label: 'In Use' },
    { value: 'under-maintenance', label: 'Under Maintenance' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'disposed', label: 'Disposed' },
];

const DEPRECIATION_METHODS = [
    { value: 'straight-line', label: 'Straight Line' },
    { value: 'declining-balance', label: 'Declining Balance' },
    { value: 'none', label: 'None' },
];

const UNITS = [
    { value: 'piece', label: 'Pieces' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'liters', label: 'Liters' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'packs', label: 'Packs' },
    { value: 'sets', label: 'Sets' },
];

export default function EditItemPage() {
    const router = useRouter();
    const params = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [assetType, setAssetType] = useState('fixed-asset');
    const [isConsumable, setIsConsumable] = useState(false);
    const [hasWarranty, setHasWarranty] = useState(false);
    const [item, setItem] = useState(null);

    // Fetch item and categories
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch item
                const itemResponse = await inventoryApi.getItemById(params.id);
                // Check success on the response directly (interceptor unwraps data)
                if (itemResponse.success || itemResponse.data?.success) {
                    const itemData = itemResponse.data || itemResponse.data?.data;
                    console.log('Fetched Item Data:', itemData); // Debug log

                    setItem(itemData);
                    setAssetType(itemData.type || 'fixed-asset');
                    setIsConsumable(itemData.isConsumable || itemData.type === 'consumable');
                    setHasWarranty(itemData.warranty?.hasWarranty || false);

                    // Set form values with date conversion
                    form.setFieldsValue({
                        ...itemData,
                        category: itemData.category?._id || itemData.category,
                        purchase: {
                            ...itemData.purchase,
                            purchaseDate: itemData.purchase?.purchaseDate ? dayjs(itemData.purchase.purchaseDate) : null,
                            invoiceDate: itemData.purchase?.invoiceDate ? dayjs(itemData.purchase.invoiceDate) : null,
                        },
                        warranty: {
                            ...itemData.warranty,
                            warrantyStartDate: itemData.warranty?.warrantyStartDate ? dayjs(itemData.warranty.warrantyStartDate) : null,
                            warrantyEndDate: itemData.warranty?.warrantyEndDate ? dayjs(itemData.warranty.warrantyEndDate) : null,
                        },
                        maintenance: {
                            ...itemData.maintenance,
                            lastMaintenanceDate: itemData.maintenance?.lastMaintenanceDate ? dayjs(itemData.maintenance.lastMaintenanceDate) : null,
                            nextMaintenanceDate: itemData.maintenance?.nextMaintenanceDate ? dayjs(itemData.maintenance.nextMaintenanceDate) : null,
                        },
                    });
                } else {
                    message.error('Failed to load item data');
                }

                // Fetch categories
                const catResponse = await inventoryApi.getCategories();
                if (catResponse.success || catResponse.data?.success) {
                    setCategories(catResponse.data || catResponse.data?.data || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                message.error('Failed to fetch item details');
            } finally {
                setFetchLoading(false);
            }
        };

        if (params.id) {
            fetchData();
        }
    }, [params.id, form]);

    // Handle type change
    const handleTypeChange = (value) => {
        setAssetType(value);
        setIsConsumable(value === 'consumable');
    };

    // Calculate depreciation
    const calculateDepreciation = () => {
        const values = form.getFieldsValue();
        const originalValue = values.financials?.originalValue || values.purchase?.purchasePrice;
        const salvageValue = values.financials?.salvageValue || 0;
        const usefulLife = values.financials?.usefulLife || 5;
        const purchaseDate = values.purchase?.purchaseDate;

        if (originalValue && usefulLife && purchaseDate) {
            const annualDep = (originalValue - salvageValue) / usefulLife;
            const yearsUsed = dayjs().diff(dayjs(purchaseDate), 'year', true);
            const accumulatedDep = Math.min(annualDep * yearsUsed, originalValue - salvageValue);
            const currentValue = Math.max(originalValue - accumulatedDep, salvageValue);

            form.setFieldsValue({
                financials: {
                    ...values.financials,
                    currentValue: Math.round(currentValue),
                    accumulatedDepreciation: Math.round(accumulatedDep),
                },
            });

            message.success('Depreciation calculated');
        } else {
            message.warning('Please fill in original value, useful life, and purchase date');
        }
    };

    // Handle form submission
    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const formData = {
                ...values,
                isConsumable,
                purchase: {
                    ...values.purchase,
                    purchaseDate: values.purchase?.purchaseDate?.format('YYYY-MM-DD'),
                    invoiceDate: values.purchase?.invoiceDate?.format('YYYY-MM-DD'),
                },
                warranty: hasWarranty ? {
                    ...values.warranty,
                    hasWarranty: true,
                    warrantyStartDate: values.warranty?.warrantyStartDate?.format('YYYY-MM-DD'),
                    warrantyEndDate: values.warranty?.warrantyEndDate?.format('YYYY-MM-DD'),
                } : { hasWarranty: false },
                maintenance: {
                    ...values.maintenance,
                    lastMaintenanceDate: values.maintenance?.lastMaintenanceDate?.format('YYYY-MM-DD'),
                    nextMaintenanceDate: values.maintenance?.nextMaintenanceDate?.format('YYYY-MM-DD'),
                },
            };

            await inventoryApi.updateItem(params.id, formData);
            message.success('Item updated successfully!');
            router.push(`/inventory/items/${params.id}`);
        } catch (error) {
            console.error('Error updating item:', error);
            message.error(error.response?.data?.message || 'Failed to update item');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="fade-in">
            <PageHeader
                title={`Edit: ${item?.name || 'Item'}`}
                subtitle="Update item information"
                breadcrumbs={[
                    { title: 'Inventory', path: '/inventory' },
                    { title: item?.name || 'Item', path: `/inventory/items/${params.id}` },
                    { title: 'Edit' },
                ]}
                backButton
            />

            <Card style={{ borderRadius: 12 }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    {/* Basic Information */}
                    <Divider orientation="left">
                        <Space><InboxOutlined /> Basic Information</Space>
                    </Divider>

                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="name"
                                label="Item Name"
                                rules={[{ required: true, message: 'Please enter item name' }]}
                            >
                                <Input placeholder="Item name" size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name="assetTag" label="Asset Tag">
                                <Input placeholder="Asset tag" size="large" disabled />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name="type" label="Asset Type" rules={[{ required: true }]}>
                                <Select size="large" onChange={handleTypeChange}>
                                    {ASSET_TYPES.map(type => (
                                        <Option key={type.value} value={type.value}>{type.label}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24} md={8}>
                            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                                <Select
                                    placeholder="Select category"
                                    size="large"
                                    showSearch
                                    optionFilterProp="children"
                                    notFoundContent={
                                        <div style={{ padding: 8, textAlign: 'center' }}>
                                            <Typography.Text>No categories found.</Typography.Text>
                                            <br />
                                            <a href="/inventory/categories">Create Category</a>
                                        </div>
                                    }
                                >
                                    {categories.map(cat => (
                                        <Option key={cat._id} value={cat._id}>{cat.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="serialNumber" label="Serial Number">
                                <Input placeholder="Serial number" size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={4}>
                            <Form.Item name="brand" label="Brand">
                                <Input placeholder="Brand" size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={4}>
                            <Form.Item name="model" label="Model">
                                <Input placeholder="Model" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24} md={6}>
                            <Form.Item name="quantity" label="Quantity">
                                <InputNumber style={{ width: '100%' }} min={1} size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name="unit" label="Unit">
                                <Select size="large">
                                    {UNITS.map(unit => (
                                        <Option key={unit.value} value={unit.value}>{unit.label}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name="condition" label="Condition" rules={[{ required: true }]}>
                                <Select size="large">
                                    {CONDITIONS.map(cond => (
                                        <Option key={cond.value} value={cond.value}>{cond.label}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                                <Select size="large">
                                    {STATUSES.map(status => (
                                        <Option key={status.value} value={status.value}>{status.label}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Purchase Information */}
                    <Divider orientation="left">Purchase Information</Divider>

                    <Row gutter={24}>
                        <Col xs={24} md={6}>
                            <Form.Item name={['purchase', 'purchaseDate']} label="Purchase Date">
                                <DatePicker style={{ width: '100%' }} size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name={['purchase', 'purchasePrice']} label="Purchase Price">
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                                    min={0}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name={['purchase', 'invoiceNumber']} label="Invoice Number">
                                <Input placeholder="Invoice number" size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name={['purchase', 'vendor', 'name']} label="Vendor">
                                <Input placeholder="Vendor name" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Financial Information */}
                    {!isConsumable && (
                        <>
                            <Divider orientation="left">Financial & Depreciation</Divider>

                            <Row gutter={24}>
                                <Col xs={24} md={6}>
                                    <Form.Item name={['financials', 'originalValue']} label="Original Value">
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                                            min={0}
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Form.Item name={['financials', 'currentValue']} label="Current Value">
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
                                            min={0}
                                            size="large"
                                            disabled
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Form.Item name={['financials', 'usefulLife']} label="Useful Life (Years)">
                                        <InputNumber style={{ width: '100%' }} min={1} max={50} size="large" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Button
                                        icon={<CalculatorOutlined />}
                                        onClick={calculateDepreciation}
                                        style={{ marginTop: 30 }}
                                        size="large"
                                    >
                                        Calculate
                                    </Button>
                                </Col>
                            </Row>
                        </>
                    )}

                    {/* Location */}
                    <Divider orientation="left">Location</Divider>

                    <Row gutter={24}>
                        <Col xs={24} md={6}>
                            <Form.Item name={['location', 'building']} label="Building">
                                <Input placeholder="Building" size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name={['location', 'floor']} label="Floor">
                                <Input placeholder="Floor" size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name={['location', 'roomName']} label="Room">
                                <Input placeholder="Room" size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name={['location', 'shelf']} label="Shelf/Rack">
                                <Input placeholder="Shelf" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Warranty */}
                    <Divider orientation="left">Warranty</Divider>

                    <Row gutter={24}>
                        <Col xs={24} md={6}>
                            <Form.Item label="Has Warranty">
                                <Switch
                                    checked={hasWarranty}
                                    onChange={setHasWarranty}
                                    checkedChildren="Yes"
                                    unCheckedChildren="No"
                                />
                            </Form.Item>
                        </Col>
                        {hasWarranty && (
                            <>
                                <Col xs={24} md={6}>
                                    <Form.Item name={['warranty', 'warrantyEndDate']} label="Warranty End">
                                        <DatePicker style={{ width: '100%' }} size="large" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Form.Item name={['warranty', 'warrantyProvider']} label="Provider">
                                        <Input placeholder="Provider" size="large" />
                                    </Form.Item>
                                </Col>
                            </>
                        )}
                    </Row>

                    {/* Description */}
                    <Divider orientation="left">Additional Information</Divider>

                    <Row gutter={24}>
                        <Col xs={24}>
                            <Form.Item name="description" label="Description">
                                <TextArea rows={3} placeholder="Description" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button size="large" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={<SaveOutlined />}
                            size="large"
                        >
                            Save Changes
                        </Button>
                    </Space>
                </Form>
            </Card>
        </div>
    );
}
