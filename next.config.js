/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

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
};

module.exports = nextConfig;