import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["abushakir", "@js-temporal/polyfill"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "54321",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "192.168.3.81",
        port: "54321",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
