import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // CDN Configuration: Use ASSET_PREFIX for static assets when deployed to CDN
  assetPrefix: process.env.ASSET_PREFIX || undefined,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 90],
    // Ensure images are also fetched through CDN if possible
    unoptimized: false,
  },

  // Experimental flags for improved bundle size and performance
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'lodash'
    ],
  },

  webpack: (config, { isServer }) => {
    // Additional webpack optimizations if needed
    return config;
  },
};

export default withBundleAnalyzer(withPWA(nextConfig));
