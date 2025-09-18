import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Durante el build, solo errores críticos fallan el build
    ignoreDuringBuilds: false,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  // Configure for Azure App Service deployment
  output: 'standalone',
  // Disable static generation for database-dependent pages during build
  experimental: {
    // Enable proper server-side rendering for Azure App Service
    serverMinification: true,
  },
  // Environment-specific configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || 'default',
  },
  // Headers for Azure App Service
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
