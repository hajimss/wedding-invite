import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/info', destination: '/', permanent: true },
      { source: '/questionnaire', destination: '/', permanent: true },
    ]
  },
};

export default nextConfig;
