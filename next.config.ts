import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: any = {
  reactCompiler: true,

  turbopack: {}, // ← Turbopack uchun bo'sh config (xatoni o'chiradi)

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

export default withPWA(nextConfig);