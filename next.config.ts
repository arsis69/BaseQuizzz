import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  // Cloudflare Pages compatibility
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
