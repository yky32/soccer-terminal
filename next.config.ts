import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/map", destination: "/", permanent: true },
      { source: "/dashboard", destination: "/leagues", permanent: false },
      { source: "/youth", destination: "/leagues", permanent: false },
      { source: "/women", destination: "/leagues", permanent: false },
      { source: "/scouting", destination: "/leagues", permanent: false },
    ];
  },
};

export default nextConfig;
