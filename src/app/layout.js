import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import Providers from '@/providers';
import NavigationProgress from '@/components/common/NavigationProgress';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'School Management System - SaaS',
  description: 'Complete school management solution with multi-branch support',
  keywords: ['school', 'management', 'saas', 'education', 'students', 'fees'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
