'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Badge, Button, Select, Spin } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
    BellOutlined,
    SunOutlined,
    MoonOutlined,
    BankOutlined,
} from '@ant-design/icons';
import { useAuthStore, useUiStore } from '@/store';
import { getMenuItemsByRole } from '@/config/menuConfig';
import { roleColors } from '@/config/theme';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const {
        sidebarCollapsed,
        toggleSidebar,
        theme,
        toggleTheme,
        selectedBranch,
        setSelectedBranch
    } = useUiStore();

    const [mounted, setMounted] = useState(false);
    const [branches, setBranches] = useState([]);

    // Fetch branches for switcher - need ALL accessible branches (including children)
    useEffect(() => {
        setMounted(true);
        const fetchBranches = async () => {
            if (['super_admin', 'main_branch_admin'].includes(user?.role)) {
                try {
                    const { branchApi } = await import('@/lib/api');

                    // Use getTree to get hierarchical structure, then flatten it for dropdown
                    const response = await branchApi.getTree();

                    // Flatten tree structure for dropdown options
                    const flattenBranches = (branches, parentName = '') => {
                        if (!branches) return [];
                        const items = Array.isArray(branches) ? branches : [branches];

                        let result = [];
                        items.forEach(branch => {
                            if (!branch) return;
                            const displayName = parentName ? `${parentName} → ${branch.name}` : branch.name;
                            result.push({
                                label: displayName,
                                value: branch._id,
                                type: branch.type
                            });
                            if (branch.children && branch.children.length > 0) {
                                result = result.concat(flattenBranches(branch.children, branch.name));
                            }
                        });
                        return result;
                    };

                    const branchOptions = flattenBranches(response.data);
                    setBranches(branchOptions);
                } catch (error) {
                    console.error("Failed to fetch branches for switcher", error);
                }
            }
        };
        if (user) fetchBranches();
    }, [user]);

    // Get menu items based on user role with Link prefetching for faster navigation
    const menuItems = useMemo(() =>
        user ? getMenuItemsByRole(user.role, Link) : [],
        [user]
    );
    const roleColor = roleColors[user?.role] || roleColors.staff;

    // User dropdown menu
    const userMenu = {
        items: [
            {
                key: 'profile',
                icon: <UserOutlined />,
                label: 'My Profile',
                onClick: () => router.push('/profile'),
            },
            {
                key: 'settings',
                icon: <SettingOutlined />,
                label: 'Settings',
                onClick: () => router.push('/settings'),
            },
            { type: 'divider' },
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Logout',
                danger: true,
                onClick: async () => {
                    await logout();
                    router.push('/login');
                },
            },
        ],
    };

    // Get selected keys for menu
    const getSelectedKeys = () => {
        const pathParts = pathname.split('/').filter(Boolean);
        if (pathParts.length === 0) return ['/dashboard'];
        return ['/' + pathParts.join('/')];
    };

    // Get open keys for submenu
    const getOpenKeys = () => {
        const pathParts = pathname.split('/').filter(Boolean);
        if (pathParts.length > 0) {
            return [pathParts[0]];
        }
        return [];
    };

    // Show skeleton layout while mounting instead of blank screen
    if (!mounted) {
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <Sider width={260} style={{ background: '#001529' }} />
                <Layout style={{ marginLeft: 260 }}>
                    <Header style={{ background: '#001529', padding: '0 24px' }} />
                    <Content style={{ margin: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Spin size="large" />
                    </Content>
                </Layout>
            </Layout>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sider
                trigger={null}
                collapsible
                collapsed={sidebarCollapsed}
                width={260}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 100,
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                        padding: sidebarCollapsed ? 0 : '0 24px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            background: roleColor.gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 18,
                        }}
                    >
                        S
                    </div>
                    {!sidebarCollapsed && (
                        <Text
                            strong
                            style={{
                                color: '#fff',
                                fontSize: 18,
                                marginLeft: 12,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            School SaaS
                        </Text>
                    )}
                </div>

                {/* Menu */}
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={getSelectedKeys()}
                    defaultOpenKeys={getOpenKeys()}
                    items={menuItems.map((item) => ({
                        ...item,
                        icon: item.icon ? <item.icon /> : null,
                    }))}
                    onClick={({ key }) => router.push(key)}
                    style={{ borderRight: 0 }}
                />
            </Sider>

            {/* Main Layout */}
            <Layout style={{ marginLeft: sidebarCollapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
                {/* Header */}
                <Header
                    style={{
                        padding: '0 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'sticky',
                        top: 0,
                        zIndex: 99,
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    {/* Left side */}
                    <Space>
                        <Button
                            type="text"
                            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={toggleSidebar}
                            style={{ fontSize: 18, color: '#fff' }}
                        />

                        {/* Branch Selector (for super_admin and main_branch_admin) */}
                        {['super_admin', 'main_branch_admin'].includes(user?.role) && (
                            <Select
                                placeholder="Select Branch"
                                value={selectedBranch}
                                onChange={(value) => {
                                    setSelectedBranch(value);
                                    // Manually update localStorage immediately to ensure it's saved before reload
                                    try {
                                        const uiStorage = localStorage.getItem('ui-storage');
                                        if (uiStorage) {
                                            const parsed = JSON.parse(uiStorage);
                                            parsed.state.selectedBranch = value;
                                            localStorage.setItem('ui-storage', JSON.stringify(parsed));
                                        }
                                    } catch (e) {
                                        console.error('Failed to save branch to localStorage', e);
                                    }
                                    window.location.reload(); // Refresh data for new branch context
                                }}
                                style={{ width: 280 }}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={branches}
                            />
                        )}
                    </Space>

                    {/* Right side */}
                    <Space size="middle">
                        {/* Theme Toggle */}
                        <Button
                            type="text"
                            icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
                            onClick={toggleTheme}
                            style={{ color: '#fff' }}
                        />

                        {/* Notifications */}
                        <Badge count={5} size="small">
                            <Button
                                type="text"
                                icon={<BellOutlined />}
                                onClick={() => router.push('/notifications')}
                                style={{ color: '#fff' }}
                            />
                        </Badge>

                        {/* User Menu */}
                        <Dropdown menu={userMenu} trigger={['click']}>
                            <Space style={{ cursor: 'pointer' }}>
                                <Avatar
                                    size="small"
                                    style={{ background: roleColor.primary }}
                                    icon={<UserOutlined />}
                                    src={user?.avatar}
                                />
                                <Text style={{ color: '#fff' }}>{user?.name || user?.email}</Text>
                            </Space>
                        </Dropdown>
                    </Space>
                </Header>

                {/* Content */}
                <Content
                    style={{
                        margin: 24,
                        minHeight: 'calc(100vh - 112px)',
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}

