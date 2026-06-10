import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy all /api/* calls to the NestJS backend. The browser only ever talks
  // to this app's origin (:3001), so the backend's httpOnly sameSite=strict
  // auth cookies are stored first-party and work without any CORS setup.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_PROXY_URL ?? "http://localhost:3000"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
