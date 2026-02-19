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

  // CORS is handled dynamically in middleware.ts
  // Do not set static CORS headers here as Access-Control-Allow-Origin
  // cannot contain multiple comma-separated origins

  // Security headers
  async rewrites() {
    return [];
  },
};

export default nextConfig;
