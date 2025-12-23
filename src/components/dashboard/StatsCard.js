'use client';

import { Card, Statistic, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function StatsCard({
  title,
  value,
  prefix,
  suffix,
  icon,
  color = '#1890ff',
  trend,
  trendValue,
  loading = false,
  onClick,
}) {
  const Icon = icon;

  return (
    <Card
      className="stats-card"
      hoverable={!!onClick}
      onClick={onClick}
      loading={loading}
      style={{
        borderRadius: 12,
        border: 'none',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      }}
      bodyStyle={{ padding: 24 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
            {title}
          </Text>
          <Statistic
            value={value}
            prefix={prefix}
            suffix={suffix}
            valueStyle={{
              fontSize: 28,
              fontWeight: 600,
              color: '#262626',
            }}
          />
          {trend && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              {trend === 'up' ? (
                <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 12 }} />
              ) : (
                <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
              )}
              <Text style={{ color: trend === 'up' ? '#52c41a' : '#ff4d4f', fontSize: 13 }}>
                {trendValue}
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>vs last month</Text>
            </div>
          )}
        </div>
        
        {Icon && (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon style={{ fontSize: 28, color }} />
          </div>
        )}
      </div>
    </Card>
  );
}

