/** @type {import('next').NextConfig} */
const contentServiceUrl = process.env.NEXT_PUBLIC_CONTENT_SERVICE_URL || 'http://localhost:8081';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Enable standalone output for Docker deployments
  output: 'standalone',

  // Skip ESLint during production builds (run separately in CI)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Image optimization
  images: {
    domains: [
      'localhost',
      'memetomoney-cdn.s3.amazonaws.com',
      'picsum.photos',
      'commondatastorage.googleapis.com',
      'storage.googleapis.com',
      'content-service-703108401175.asia-south2.run.app'
    ],
    formats: ['image/webp', 'image/avif'],
  },
  async rewrites() {
    return [
      {
        source: '/api/images/:path*',
        destination: `${contentServiceUrl}/api/images/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
