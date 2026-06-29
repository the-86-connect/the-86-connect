import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_PROXY_URL || "http://localhost:3001";

const nextConfig: NextConfig = {
  // Enable gzip compression for all responses
  compress: true,

  // Remove X-Powered-By header for security
  poweredByHeader: false,

  // Strict mode for catching potential issues
  reactStrictMode: true,

  // Image optimization — serve modern formats, allow YouTube thumbnails
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  async headers() {
    if (process.env.NODE_ENV === "development") {
      return [];
    }
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
      {
        source: "/og-image.jpg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800",
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/health",
        destination: `${BACKEND_URL}/health`,
      },
    ];
  },
};

export default nextConfig;
