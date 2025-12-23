'use client';

import { Table, Card, Input, Button, Space, Dropdown, Tooltip } from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  SettingOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

export default function DataTable({
  columns,
  dataSource,
  loading = false,
  pagination = {},
  onChange,
  onSearch,
  onRefresh,
  onExport,
  searchPlaceholder = 'Search...',
  title,
  extra,
  rowSelection,
  scroll,
  bordered = false,
  size = 'middle',
  expandable,
  showSearch = true,
  showRefresh = true,
  showExport = false,
}) {
  console.log("source",dataSource)
  const [searchText, setSearchText] = useState('');

  const handleSearch = (value) => {
    setSearchText(value);
    onSearch?.(value);
  };

  const defaultPagination = {
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
    pageSizeOptions: ['10', '20', '50', '100'],
    ...pagination,
  };

  return (
    <Card
      title={title}
      extra={
        <Space>
          {showSearch && (
            <Input.Search
              placeholder={searchPlaceholder}
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              style={{ width: 250 }}
            />
          )}
          {showRefresh && (
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={onRefresh} />
            </Tooltip>
          )}
          {showExport && (
            <Tooltip title="Export">
              <Button icon={<DownloadOutlined />} onClick={onExport} />
            </Tooltip>
          )}
          {extra}
        </Space>
      }
      style={{ borderRadius: 12 }}
      bodyStyle={{ padding: 0 }}
    >
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={defaultPagination}
        onChange={onChange}
        rowSelection={rowSelection}
        scroll={scroll || { x: 'max-content' }}
        bordered={bordered}
        size={size}
        expandable={expandable}
        rowKey={(record) => record._id || record.id || record.key}
      />
    </Card>
  );
}

