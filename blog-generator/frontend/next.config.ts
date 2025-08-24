import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
  reactStrictMode: false, // Reduces hydration warnings in development
  swcMinify: true,
};

export default nextConfig;
