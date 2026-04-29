import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'x-middleware-subrequest',
                        value: '',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
