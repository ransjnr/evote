import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "media.licdn.com",
      "images.unsplash.com",
      "res.cloudinary.com",
      "placehold.co",
      "example.com",
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
