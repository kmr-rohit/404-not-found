import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cloud.appwrite.io" },
      { protocol: "https", hostname: "fra.cloud.appwrite.io" },
      { protocol: "https", hostname: "us-east-1.cloud.appwrite.io" },
      { protocol: "https", hostname: "ap-south-1.cloud.appwrite.io" },
    ],
  },
};

export default nextConfig;
