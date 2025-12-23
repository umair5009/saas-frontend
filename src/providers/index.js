'use client';

import AntdProvider from './AntdProvider';
import QueryProvider from './QueryProvider';
import AuthProvider from './AuthProvider';

export default function Providers({ children }) {
  return (
    <QueryProvider>
      <AntdProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </AntdProvider>
    </QueryProvider>
  );
}

export { AntdProvider, QueryProvider, AuthProvider };

