'use client';

import { Skeleton, Card, Row, Col, Space } from 'antd';

export default function DashboardLoading() {
  return (
    <div style={{ padding: 0 }}>
      {/* Page Header Skeleton */}
      <div style={{ marginBottom: 24 }}>
        <Skeleton.Input active style={{ width: 200, height: 32 }} />
        <Skeleton.Input active style={{ width: 300, height: 16, marginTop: 8 }} />
      </div>

      {/* Stats Cards Skeleton */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={12} sm={6} key={i}>
            <Card style={{ borderRadius: 12 }}>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content Skeleton */}
      <Card style={{ borderRadius: 12 }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    </div>
  );
}
