'use client';

import { ConfigProvider, App as AntdApp, theme as antdTheme } from 'antd';
import { StyleProvider, createCache } from '@ant-design/cssinjs';
import { useUiStore } from '@/store';
import { lightTheme, darkTheme } from '@/config/theme';
import { useState, useEffect } from 'react';

export default function AntdProvider({ children }) {
  const themeMode = useUiStore((state) => state.theme);
  const [cache] = useState(() => createCache());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;

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

