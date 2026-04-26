import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for the multi-stage Dockerfile — produces a minimal standalone
  // runtime bundle at .next/standalone. Safe for Vercel (Vercel ignores this).
  output: "standalone",
  images: {
    domains: ["lh3.googleusercontent.com", "ui-avatars.com"],
  },
};

export default nextConfig;
