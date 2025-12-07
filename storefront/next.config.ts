import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "popmart.com",
      },
      {
        protocol: "https",
        hostname: "store.storeimages.cdn-apple.com",
      },
      // QPay logo
      {
        protocol: "https",
        hostname: "qpay.mn",
      },
      // Bank app logos from Google Play Store
      {
        protocol: "https",
        hostname: "play-lh.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
