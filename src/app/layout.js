import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/providers';

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
