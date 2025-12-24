'use client';

import { ConfigProvider, App as AntdApp, theme as antdTheme, Spin } from 'antd';
import { StyleProvider, createCache } from '@ant-design/cssinjs';
import { useUiStore } from '@/store';
import { lightTheme, darkTheme } from '@/config/theme';
import { useState, useEffect, useMemo } from 'react';

// Loading spinner for initial mount
const InitialLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#f0f2f5'
  }}>
    <Spin size="large" />
  </div>
);

export default function AntdProvider({ children }) {
  const themeMode = useUiStore((state) => state.theme);
  const cache = useMemo(() => createCache(), []);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;

  // Show loading spinner instead of null to prevent blank screen
  if (!mounted) {
    return (
      <ConfigProvider theme={lightTheme}>
        <InitialLoader />
      </ConfigProvider>
    );
  }

  return (
    <StyleProvider cache={cache}>
      <ConfigProvider
        theme={{
          ...currentTheme,
          algorithm: themeMode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        }}
      >
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </StyleProvider>
  );
}

