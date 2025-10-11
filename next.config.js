/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Environment variables for server-side
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8080',
    USER_SERVICE_URL: process.env.USER_SERVICE_URL || process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8080',
    CONTENT_SERVICE_URL: process.env.CONTENT_SERVICE_URL || process.env.NEXT_PUBLIC_CONTENT_SERVICE_URL || 'http://localhost:8081',
    MONETIZATION_SERVICE_URL: process.env.MONETIZATION_SERVICE_URL || process.env.NEXT_PUBLIC_MONETIZATION_SERVICE_URL || 'http://localhost:8082',
  },

  // Public runtime configuration for client-side access
  publicRuntimeConfig: {
    USER_SERVICE_URL: process.env.NEXT_PUBLIC_USER_SERVICE_URL || process.env.USER_SERVICE_URL || 'http://localhost:8080',
    CONTENT_SERVICE_URL: process.env.NEXT_PUBLIC_CONTENT_SERVICE_URL || process.env.CONTENT_SERVICE_URL || 'http://localhost:8081',
    MONETIZATION_SERVICE_URL: process.env.NEXT_PUBLIC_MONETIZATION_SERVICE_URL || process.env.MONETIZATION_SERVICE_URL || 'http://localhost:8082',
  },

  // Rewrites for API proxy - using environment variables with fallbacks
  async rewrites() {
    const userServiceUrl = process.env.NEXT_PUBLIC_USER_SERVICE_URL || process.env.USER_SERVICE_URL || 'http://localhost:8080';
    const contentServiceUrl = process.env.NEXT_PUBLIC_CONTENT_SERVICE_URL || process.env.CONTENT_SERVICE_URL || 'http://localhost:8081';
    const monetizationServiceUrl = process.env.NEXT_PUBLIC_MONETIZATION_SERVICE_URL || process.env.MONETIZATION_SERVICE_URL || 'http://localhost:8082';

    return [
      {
        source: '/api/auth/:path*',
        destination: `${userServiceUrl}/api/auth/:path*`,
      },
      {
        source: '/api/users/:path*',
        destination: `${userServiceUrl}/api/users/:path*`,
      },
      {
        source: '/api/content/:path*',
        destination: `${contentServiceUrl}/api/content/:path*`,
      },
      {
        source: '/api/wallet/:path*',
        destination: `${monetizationServiceUrl}/api/wallet/:path*`,
      }
    ];
  },

  // Image optimization
  images: {
    domains: [
      'localhost',
      'memetomoney-cdn.s3.amazonaws.com',
      'picsum.photos',
      'commondatastorage.googleapis.com'
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Performance optimizations
  experimental: {
    optimizeCss: true,
  },

  // Output configuration for Docker deployment
  output: 'standalone',
};

module.exports = nextConfig;