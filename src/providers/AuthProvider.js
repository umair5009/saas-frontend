'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Spin } from 'antd';
import useAuthStore from '@/store/authStore';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, initAuth, getMe } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      initAuth();

      // Verify token is still valid
      if (!publicRoutes.some((route) => pathname.startsWith(route))) {
        await getMe();
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

      if (!isAuthenticated && !isPublicRoute) {
        router.push('/login');
      } else if (isAuthenticated && isPublicRoute) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f0f2f5'
      }}>
        <Spin size="large" tip="Loading...">
          <div style={{ padding: 50 }} />
        </Spin>
      </div>
    );
  }

  return children;
}

