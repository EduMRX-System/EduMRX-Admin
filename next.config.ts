import type { NextConfig } from "next";

const nextConfig: any = {
  reactCompiler: true, // experimental ichidan tashqariga chiqarildi

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "edumrx-1.onrender.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.edumrx.uz",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "edumrx.uz",
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://www.edumrx.uz/api/:path*",
      },
    ];
  },
};

export default nextConfig;
