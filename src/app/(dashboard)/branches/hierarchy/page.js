'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    Tree,
    Button,
    Space,
    Typography,
    Tag,
    Empty,
    Spin
} from 'antd';
import {
    BankOutlined,
    DownOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { branchApi } from '@/lib/api';

const { Text } = Typography;

export default function BranchHierarchyPage() {
    const router = useRouter();
    const [treeData, setTreeData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTree();
    }, []);

    const fetchTree = async () => {
        try {
            setLoading(true);
            const response = await branchApi.getTree();
            console.log("Tree API Response:", response.data);

            // Handle both array format (super_admin) and single object format (main_branch_admin)
            let branches = response.data;
            if (!Array.isArray(branches)) {
                // If it's a single branch object (for main_branch_admin), wrap it in an array
                branches = branches ? [branches] : [];
            }

            const nodes = mapBranchesToTreeNodes(branches);
            setTreeData(nodes);
        } catch (error) {
            console.error("Error fetching tree:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to standardise tree node format
    const mapBranchesToTreeNodes = (branches) => {
        if (!branches || !Array.isArray(branches)) return [];
        return branches.map(branch => ({
            title: (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '4px 0' }}>
                    <Space>
                        <Tag color={branch.type === 'main' ? 'purple' : 'blue'}>{branch.type?.toUpperCase()}</Tag>
                        <Text strong>{branch.name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>({branch.code})</Text>
                    </Space>
                    <Button size="small" type="link" onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/branches/${branch._id}`);
                    }}>
                        View Details <ArrowRightOutlined />
                    </Button>
                </div>
            ),
            key: branch._id,
            icon: <BankOutlined />,
            children: branch.children ? mapBranchesToTreeNodes(branch.children) : [],
            isLeaf: !branch.children || branch.children.length === 0,
        }));
    };

    return (
        <div className="fade-in">
            <PageHeader
                title="Branch Hierarchy"
                subtitle="Visualise your network structure"
                breadcrumbs={[
                    { title: 'Branches', href: '/branches' },
                    { title: 'Hierarchy' },
                ]}
            />

            <Card>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 50 }}>
                        <Spin size="large" />
                    </div>
                ) : treeData.length > 0 ? (
                    <Tree
                        showIcon
                        defaultExpandAll
                        switcherIcon={<DownOutlined />}
                        treeData={treeData}
                        blockNode
                        style={{ fontSize: 16 }}
                        selectable={false}
                    />
                ) : (
                    <Empty description="No branch hierarchy found" />
                )}
            </Card>
        </div>
    );
}
