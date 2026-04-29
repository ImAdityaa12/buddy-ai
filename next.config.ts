import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'inngest/components/InngestFunction': path.resolve(
        './node_modules/inngest/components/InngestFunction.js'
      ),
      'inngest/helpers/errors': path.resolve(
        './node_modules/inngest/helpers/errors.js'
      ),
    };
    return config;
  },
};

export default nextConfig;
