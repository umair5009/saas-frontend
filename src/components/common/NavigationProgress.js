'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset when navigation completes
    setIsNavigating(false);
    setProgress(100);

    const timeout = setTimeout(() => {
      setProgress(0);
    }, 200);

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  useEffect(() => {
    let interval;

    if (isNavigating) {
      setProgress(10);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);
    }

    return () => clearInterval(interval);
  }, [isNavigating]);

  // Listen for navigation start
  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('a');
      if (target && target.href && target.href.startsWith(window.location.origin)) {
        const url = new URL(target.href);
        if (url.pathname !== pathname) {
          setIsNavigating(true);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  if (progress === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9999,
        background: 'transparent',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #1890ff, #722ed1)',
          transition: progress === 100 ? 'width 0.2s, opacity 0.4s' : 'width 0.4s',
          opacity: progress === 100 ? 0 : 1,
          boxShadow: '0 0 10px rgba(24, 144, 255, 0.5)',
        }}
      />
    </div>
  );
}
