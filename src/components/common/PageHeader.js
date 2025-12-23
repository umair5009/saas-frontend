'use client';

import { Typography, Space, Breadcrumb, Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  backButton = false,
}) {
  const router = useRouter();

  return (
    <div className="page-header" style={{ marginBottom: 24 }}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumb
          style={{ marginBottom: 16 }}
          items={[
            {
              title: (
                <Link href="/dashboard">
                  <HomeOutlined />
                </Link>
              ),
            },
            ...breadcrumbs.map((item, index) => ({
              title: item.path ? (
                <Link href={item.path}>{item.title}</Link>
              ) : (
                item.title
              ),
            })),
          ]}
        />
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <Space align="center" style={{ marginBottom: subtitle ? 4 : 0 }}>
            {backButton && (
              <Button type="text" onClick={() => router.back()}>
                ← Back
              </Button>
            )}
            <Title level={3} style={{ marginBottom: 0 }}>
              {title}
            </Title>
          </Space>
          {subtitle && <Text type="secondary">{subtitle}</Text>}
        </div>
        
        {actions && <Space>{actions}</Space>}
      </div>
    </div>
  );
}

