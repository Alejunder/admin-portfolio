import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  reactStrictMode: true,
  
  // Image optimization domains (add if you use next/image)
  images: {
    domains: ['bqoozzswhylbfbgxcdfm.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  // CORS headers for API routes
  async headers() {
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? ['https://alecam.dev', 'https://www.alecam.dev']
      : ['http://localhost:5173', 'http://localhost:5174'];

    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedOrigins.join(','),
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, Cookie',
          },
        ],
      },
    ];
  },

  // Security headers
  async rewrites() {
    return [];
  },
};

export default nextConfig;
