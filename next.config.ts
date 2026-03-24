import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  serverExternalPackages: ['yahoo-finance2'],
  outputFileTracingRoot: path.join(__dirname, '../'),
};

export default nextConfig;
