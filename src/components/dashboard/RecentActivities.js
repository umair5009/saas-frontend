'use client';

import { Card, List, Avatar, Typography, Tag, Space } from 'antd';
import {
  UserAddOutlined,
  DollarOutlined,
  BookOutlined,
  CalendarOutlined,
  BellOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const activityIcons = {
  CREATE: UserAddOutlined,
  UPDATE: SettingOutlined,
  DELETE: CalendarOutlined,
  PAYMENT: DollarOutlined,
  ATTENDANCE: CalendarOutlined,
  NOTIFICATION: BellOutlined,
  default: BookOutlined,
};

const activityColors = {
  CREATE: '#52c41a',
  UPDATE: '#1890ff',
  DELETE: '#ff4d4f',
  PAYMENT: '#faad14',
  ATTENDANCE: '#13c2c2',
  default: '#8c8c8c',
};

export default function RecentActivities({ activities = [], loading = false }) {
  return (
    <Card
      title={
        <Title level={5} style={{ marginBottom: 0 }}>
          Recent Activities
        </Title>
      }
      style={{ borderRadius: 12 }}
      bodyStyle={{ padding: 0 }}
    >
      <List
        loading={loading}
        dataSource={activities}
        renderItem={(item) => {
          const Icon = activityIcons[item.action] || activityIcons.default;
          const color = activityColors[item.action] || activityColors.default;

          return (
            <List.Item style={{ padding: '12px 24px' }}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{ background: `${color}15` }}
                    icon={<Icon style={{ color }} />}
                  />
                }
                title={
                  <Space>
                    <Text>{item.description}</Text>
                    <Tag color={color} style={{ marginLeft: 8 }}>{item.module}</Tag>
                  </Space>
                }
                description={
                  <Space size="small">
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.user?.name || 'System'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>•</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(item.createdAt).fromNow()}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          );
        }}
        locale={{ emptyText: 'No recent activities' }}
      />
    </Card>
  );
}

