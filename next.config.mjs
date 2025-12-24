/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Remove console.log in production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
};

export default nextConfig;
