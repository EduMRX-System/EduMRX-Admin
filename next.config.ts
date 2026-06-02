import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */

const nextConfig: NextConfig = {
  reactCompiler: true,

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
