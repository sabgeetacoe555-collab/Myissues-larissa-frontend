/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  env: {
    VOLCANO_BASE_URL: process.env.VOLCANO_BASE_URL,
    VOLCANO_API_KEY: process.env.VOLCANO_API_KEY,
  },
}

module.exports = nextConfig
