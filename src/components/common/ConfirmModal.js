'use client';

import React from 'react';
import { Modal, Typography, Space } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const iconConfig = {
  delete: { icon: <DeleteOutlined />, color: '#ff4d4f' },
  warning: { icon: <WarningOutlined />, color: '#faad14' },
  confirm: { icon: <ExclamationCircleOutlined />, color: '#1890ff' },
};

export default function ConfirmModal({
  open,
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  type = 'confirm',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  danger = false,
}) {
  const config = iconConfig[type] || iconConfig.confirm;

  return (
    <Modal
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={confirmText}
      cancelText={cancelText}
      okButtonProps={{ danger: danger || type === 'delete', loading }}
      centered
      width={400}
    >
      <Space align="start" size={16}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: `${config.color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {React.cloneElement(config.icon, { style: { fontSize: 24, color: config.color } })}
        </div>
        <div>
          <Text strong style={{ fontSize: 16 }}>{title}</Text>
          <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
            {message}
          </Paragraph>
        </div>
      </Space>
    </Modal>
  );
}

