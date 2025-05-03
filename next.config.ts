import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      fallback: [
        // Proxy API requests to backend server during development
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
