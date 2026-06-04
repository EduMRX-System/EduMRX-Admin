import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gkwfbttkyjdxselgxbyz.supabase.co",
        port: "",
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
