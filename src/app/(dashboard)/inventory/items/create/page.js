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
    DatePicker,
    message,
    Divider,
    Typography,
    Switch,
    Radio,
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
    { value: 'meters', label: 'Meters' },
    { value: 'rolls', label: 'Rolls' },
];

export default function CreateItemPage() {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [assetType, setAssetType] = useState('fixed-asset');
    const [isConsumable, setIsConsumable] = useState(false);
    const [hasWarranty, setHasWarranty] = useState(false);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await inventoryApi.getCategories();
                if (response.success) {
                    setCategories(response.data || []);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                message.error('Failed to load categories');
            } finally {
                setCategoriesLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // Handle asset type change
    const handleTypeChange = (value) => {
        setAssetType(value);
        setIsConsumable(value === 'consumable');
        form.setFieldsValue({ isConsumable: value === 'consumable' });
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
                    depreciationRate: Math.round((annualDep / originalValue) * 100),
                },
            });

            message.success('Depreciation calculated successfully');
        } else {
            message.warning('Please fill in original value, useful life, and purchase date');
        }
    };

    // Handle form submission
    const handleSubmit = async (values) => {

        console.log("values", values)
        setLoading(true);
        try {
            // Format dates
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

            await inventoryApi.createItem(formData);
            message.success('Item created successfully!');
            router.push('/inventory');
        } catch (error) {
            console.error('Error creating item:', error);
            message.error(error.response?.data?.message || 'Failed to create item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <PageHeader
                title="Add New Item"
                subtitle="Register a new asset or item in the inventory system"
                breadcrumbs={[
                    { title: 'Inventory', path: '/inventory' },
                    { title: 'Add Item' },
                ]}
                backButton
            />

            <Card style={{ borderRadius: 12 }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        type: 'fixed-asset',
                        status: 'available',
                        condition: 'new',
                        quantity: 1,
                        unit: 'piece',
                        isConsumable: false,
                        financials: {
                            depreciationMethod: 'straight-line',
                            usefulLife: 5,
                            salvageValue: 0,
                        },
                    }}
                >
                    {/* Basic Information */}
                    <Divider orientation="left">
                        <Space>
                            <InboxOutlined />
                            Basic Information
                        </Space>
                    </Divider>

                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="name"
                                label="Item Name"
                                rules={[{ required: true, message: 'Please enter item name' }]}
                            >
                                <Input placeholder="e.g., Dell Laptop, Classroom Projector" size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item
                                name="assetTag"
                                label="Asset Tag"
                                tooltip="Leave empty to auto-generate"
                            >
                                <Input placeholder="Auto-generated if empty" size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item
                                name="type"
                                label="Asset Type"
                                rules={[{ required: true }]}
                            >
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
                            <Form.Item
                                name="category"
                                label="Category"
                                rules={[{ required: true, message: 'Please select a category' }]}
                            >
                                <Select
                                    placeholder="Select category"
                                    size="large"
                                    loading={categoriesLoading}
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
                                <Input placeholder="Manufacturer serial number" size="large" />
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

                    {/* Quantity (for all items, required for consumables) */}
                    <Row gutter={24}>
                        <Col xs={24} md={6}>
                            <Form.Item
                                name="quantity"
                                label="Quantity"
                                rules={[{ required: isConsumable, message: 'Quantity is required for consumables' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={1}
                                    placeholder="Quantity"
                                    size="large"
                                />
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
                        {isConsumable && (
                            <>
                                <Col xs={24} md={6}>
                                    <Form.Item
                                        name="reorderLevel"
                                        label="Reorder Level"
                                        tooltip="Alert when stock falls below this level"
                                    >
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            min={0}
                                            placeholder="Minimum stock"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Form.Item name="reorderQuantity" label="Reorder Quantity">
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            min={1}
                                            placeholder="Order quantity"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                            </>
                        )}
                    </Row>

                    {/* Purchase Information */}
                    <Divider orientation="left">Purchase Information</Divider>

                    <Row gutter={24}>
                        <Col xs={24} md={6}>
                            <Form.Item
                                name={['purchase', 'purchaseDate']}
                                label="Purchase Date"
                                rules={[{ required: true, message: 'Please select purchase date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item
                                name={['purchase', 'purchasePrice']}
                                label="Purchase Price"
                                rules={[{ required: true, message: 'Please enter purchase price' }]}
                            >
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
                            <Form.Item name={['purchase', 'purchaseOrderNumber']} label="PO Number">
                                <Input placeholder="Purchase order number" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24} md={8}>
                            <Form.Item name={['purchase', 'vendor', 'name']} label="Vendor/Supplier">
                                <Input placeholder="Supplier name" size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name={['purchase', 'vendor', 'phone']} label="Vendor Phone">
                                <Input placeholder="Contact phone" size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name={['purchase', 'vendor', 'email']} label="Vendor Email">
                                <Input placeholder="Contact email" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Financial Information (for fixed assets) */}
                    {!isConsumable && (
                        <>
                            <Divider orientation="left">Financial & Depreciation</Divider>

                            <Row gutter={24}>
                                <Col xs={24} md={6}>
                                    <Form.Item
                                        name={['financials', 'originalValue']}
                                        label="Original Value"
                                    >
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
                                    <Form.Item name={['financials', 'salvageValue']} label="Salvage Value">
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
                                    <Form.Item name={['financials', 'usefulLife']} label="Useful Life (Years)">
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            min={1}
                                            max={50}
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Form.Item name={['financials', 'depreciationMethod']} label="Depreciation Method">
                                        <Select size="large">
                                            {DEPRECIATION_METHODS.map(method => (
                                                <Option key={method.value} value={method.value}>{method.label}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={24}>
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
                                    <Form.Item name={['financials', 'accumulatedDepreciation']} label="Accumulated Depreciation">
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
                                    <Button
                                        type="default"
                                        icon={<CalculatorOutlined />}
                                        onClick={calculateDepreciation}
                                        style={{ marginTop: 30 }}
                                        size="large"
                                    >
                                        Calculate Depreciation
                                    </Button>
                                </Col>
                            </Row>
                        </>
                    )}

                    {/* Location & Condition */}
                    <Divider orientation="left">Location & Condition</Divider>

                    <Row gutter={24}>
                        <Col xs={24} md={6}>
                            <Form.Item
                                name="condition"
                                label="Condition"
                                rules={[{ required: true }]}
                            >
                                <Select size="large">
                                    {CONDITIONS.map(cond => (
                                        <Option key={cond.value} value={cond.value}>{cond.label}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item
                                name="status"
                                label="Status"
                                rules={[{ required: true }]}
                            >
                                <Select size="large">
                                    {STATUSES.map(status => (
                                        <Option key={status.value} value={status.value}>{status.label}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name={['location', 'building']} label="Building">
                                <Input placeholder="Building name" size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name={['location', 'roomName']} label="Room">
                                <Input placeholder="Room name/number" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24} md={6}>
                            <Form.Item name={['location', 'floor']} label="Floor">
                                <Input placeholder="Floor" size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name={['location', 'shelf']} label="Shelf/Rack">
                                <Input placeholder="Shelf or rack location" size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name={['location', 'area']} label="Area/Zone">
                                <Input placeholder="Area or zone description" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Warranty Information */}
                    <Divider orientation="left">Warranty Information</Divider>

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
                                    <Form.Item name={['warranty', 'warrantyStartDate']} label="Warranty Start">
                                        <DatePicker style={{ width: '100%' }} size="large" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Form.Item name={['warranty', 'warrantyEndDate']} label="Warranty End">
                                        <DatePicker style={{ width: '100%' }} size="large" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Form.Item name={['warranty', 'warrantyProvider']} label="Provider">
                                        <Input placeholder="Warranty provider" size="large" />
                                    </Form.Item>
                                </Col>
                            </>
                        )}
                    </Row>

                    {hasWarranty && (
                        <Row gutter={24}>
                            <Col xs={24} md={12}>
                                <Form.Item name={['warranty', 'warrantyTerms']} label="Warranty Terms">
                                    <TextArea rows={2} placeholder="Warranty terms and conditions" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name={['warranty', 'warrantyContact']} label="Contact Info">
                                    <Input placeholder="Contact for warranty claims" size="large" />
                                </Form.Item>
                            </Col>
                        </Row>
                    )}

                    {/* Additional Information */}
                    <Divider orientation="left">Additional Information</Divider>

                    <Row gutter={24}>
                        <Col xs={24}>
                            <Form.Item name="description" label="Description">
                                <TextArea rows={3} placeholder="Additional notes or description about the item" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item name="notes" label="Notes">
                                <TextArea rows={2} placeholder="Internal notes" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="tags" label="Tags" tooltip="Comma-separated tags for easy filtering">
                                <Select
                                    mode="tags"
                                    style={{ width: '100%' }}
                                    placeholder="Add tags"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button
                            size="large"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={<SaveOutlined />}
                            size="large"
                        >
                            Create Item
                        </Button>
                    </Space>
                </Form>
            </Card>
        </div>
    );
}
