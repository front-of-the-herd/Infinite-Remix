import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: { serverActions: { allowedOrigins: ['localhost:3000'] } },
  // Allow ffmpeg binary execution in API routes
  serverExternalPackages: ['fluent-ffmpeg', '@google/genai', 'ws', 'bufferutil', 'utf-8-validate'],
};

export default nextConfig;
