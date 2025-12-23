'use client';

import { Tag } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';

const statusConfig = {
  // General statuses
  active: { color: 'success', icon: <CheckCircleOutlined />, text: 'Active' },
  inactive: { color: 'default', icon: <MinusCircleOutlined />, text: 'Inactive' },
  pending: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Pending' },
  approved: { color: 'success', icon: <CheckCircleOutlined />, text: 'Approved' },
  rejected: { color: 'error', icon: <CloseCircleOutlined />, text: 'Rejected' },
  cancelled: { color: 'default', icon: <CloseCircleOutlined />, text: 'Cancelled' },
  
  // Student statuses
  enrolled: { color: 'success', icon: <CheckCircleOutlined />, text: 'Enrolled' },
  graduated: { color: 'blue', icon: <CheckCircleOutlined />, text: 'Graduated' },
  suspended: { color: 'error', icon: <ExclamationCircleOutlined />, text: 'Suspended' },
  expelled: { color: 'error', icon: <CloseCircleOutlined />, text: 'Expelled' },
  transferred: { color: 'purple', icon: <SyncOutlined />, text: 'Transferred' },
  withdrawn: { color: 'default', icon: <MinusCircleOutlined />, text: 'Withdrawn' },
  
  // Staff statuses
  on_leave: { color: 'warning', icon: <ClockCircleOutlined />, text: 'On Leave' },
  terminated: { color: 'error', icon: <CloseCircleOutlined />, text: 'Terminated' },
  resigned: { color: 'default', icon: <MinusCircleOutlined />, text: 'Resigned' },
  
  // Fee statuses
  paid: { color: 'success', icon: <CheckCircleOutlined />, text: 'Paid' },
  partial: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Partial' },
  overdue: { color: 'error', icon: <ExclamationCircleOutlined />, text: 'Overdue' },
  waived: { color: 'purple', icon: <CheckCircleOutlined />, text: 'Waived' },
  refunded: { color: 'cyan', icon: <SyncOutlined />, text: 'Refunded' },
  
  // Attendance statuses
  present: { color: 'success', icon: <CheckCircleOutlined />, text: 'Present' },
  absent: { color: 'error', icon: <CloseCircleOutlined />, text: 'Absent' },
  late: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Late' },
  leave: { color: 'blue', icon: <MinusCircleOutlined />, text: 'Leave' },
  
  // Exam statuses
  scheduled: { color: 'blue', icon: <ClockCircleOutlined />, text: 'Scheduled' },
  ongoing: { color: 'processing', icon: <SyncOutlined spin />, text: 'Ongoing' },
  completed: { color: 'success', icon: <CheckCircleOutlined />, text: 'Completed' },
  published: { color: 'success', icon: <CheckCircleOutlined />, text: 'Published' },
  draft: { color: 'default', icon: <MinusCircleOutlined />, text: 'Draft' },
  'marks-entry': { color: 'purple', icon: <SyncOutlined />, text: 'Marks Entry' },
  
  // Library statuses
  available: { color: 'success', icon: <CheckCircleOutlined />, text: 'Available' },
  issued: { color: 'blue', icon: <SyncOutlined />, text: 'Issued' },
  returned: { color: 'success', icon: <CheckCircleOutlined />, text: 'Returned' },
  reserved: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Reserved' },
  lost: { color: 'error', icon: <CloseCircleOutlined />, text: 'Lost' },
  damaged: { color: 'warning', icon: <ExclamationCircleOutlined />, text: 'Damaged' },
  
  // Inventory statuses
  in_stock: { color: 'success', icon: <CheckCircleOutlined />, text: 'In Stock' },
  low_stock: { color: 'warning', icon: <ExclamationCircleOutlined />, text: 'Low Stock' },
  out_of_stock: { color: 'error', icon: <CloseCircleOutlined />, text: 'Out of Stock' },
  critical: { color: 'error', icon: <ExclamationCircleOutlined />, text: 'Critical' },
  
  // Transport statuses
  'on-route': { color: 'processing', icon: <SyncOutlined spin />, text: 'On Route' },
  maintenance: { color: 'warning', icon: <ExclamationCircleOutlined />, text: 'Maintenance' },
};

export default function StatusTag({ status, customText, showIcon = true }) {
  const config = statusConfig[status] || {
    color: 'default',
    icon: null,
    text: status?.replace(/_/g, ' ').replace(/-/g, ' ').toUpperCase() || 'Unknown',
  };

  return (
    <Tag color={config.color} icon={showIcon ? config.icon : null}>
      {customText || config.text}
    </Tag>
  );
}

