'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Card, Button, Upload, Table, Space, Steps, message, Typography } from 'antd';
import { InboxOutlined, SaveOutlined } from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { studentApi } from '@/lib/api';

const { Dragger } = Upload;
const { Text } = Typography;

export default function BulkImportStudentsPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [preview, setPreview] = useState([]);
  const [columns, setColumns] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const parseCSV = async (file) => {
    const text = await file.text();
    const rows = text.split(/\r?\n/).map((r) => r.split(','));
    if (rows.length < 2) return;
    const header = rows[0];
    setColumns(header.map(h => ({ title: h, dataIndex: h, key: h })));
    setPreview(rows.slice(1).filter((r) => r.filter(Boolean).length).map(r => Object.fromEntries(header.map((h, i) => [h, r[i]]))));
    setStep(1);
  };
  const props = {
    beforeUpload(file) {
      setFileList([file]);
      parseCSV(file);
      return false;
    },
    showUploadList: false,
    accept: '.csv',
  };
  const handleImport = async () => {
    setImporting(true);
    try {
      await studentApi.bulkImport({ students: preview }); // backend contract expects { students: [...] }
      setResult('success');
      message.success('Students imported successfully!');
      router.push('/students');
    } catch (err) {
      message.error('Import failed');
      setResult('fail');
    } finally {
      setImporting(false);
    }
  };
  return (
    <div className="fade-in">
      <PageHeader
        title="Import Students"
        subtitle="Bulk import students via CSV file"
        breadcrumbs={[{ title: 'Students', path: '/students' }, { title: 'Import' }]}
        backButton
      />
      <Card style={{ borderRadius: 12 }}>
        <Steps current={step} items={[{ title: 'Upload CSV' }, { title: 'Preview' }, { title: 'Import' }]} />
        {step === 0 && (
          <Dragger {...props} style={{ marginTop: 32, padding: 32 }} multiple={false}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: '#1890ff', fontSize: 48 }} />
            </p>
            <p className="ant-upload-text">Click or drag CSV file to upload</p>
            <p className="ant-upload-hint">
              Format: firstName,lastName,email,gender,class,section,etc.
            </p>
          </Dragger>
        )}
        {step === 1 && preview.length > 0 && (
          <>
            <Table columns={columns} dataSource={preview} rowKey={(_, idx) => idx} pagination={false} style={{ marginTop: 32 }} />
            <Space style={{ marginTop: 24 }}>
              <Button onClick={() => setStep(0)}>Back</Button>
              <Button type="primary" icon={<SaveOutlined />} loading={importing} onClick={handleImport}>Import All</Button>
            </Space>
          </>
        )}
        {result === 'fail' && <Text type="danger">Some records failed to import. Check format/errors and try again.</Text>}
      </Card>
    </div>
  );
}
