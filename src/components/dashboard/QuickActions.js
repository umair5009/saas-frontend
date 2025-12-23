'use client';

import { Card, Button, Typography, Space } from 'antd';
import { useRouter } from 'next/navigation';
import { quickActions } from '@/config/menuConfig';
import { useAuthStore } from '@/store';

const { Title } = Typography;

export default function QuickActions() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const actions = quickActions[user?.role] || [];

  if (actions.length === 0) return null;

  return (
    <Card
      title={
        <Title level={5} style={{ marginBottom: 0 }}>
          Quick Actions
        </Title>
      }
      style={{ borderRadius: 12 }}
    >
      <Space wrap size={[12, 12]}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.key}
              type="default"
              size="large"
              icon={<Icon />}
              onClick={() => router.push(action.path)}
              style={{
                height: 'auto',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 8,
              }}
            >
              {action.label}
            </Button>
          );
        })}
      </Space>
    </Card>
  );
}

