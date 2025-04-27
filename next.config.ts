import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Disable PWA in development
  // register: true, // Kept default for now, can enable later if needed
  // skipWaiting: true, // Kept default for now, can enable later if needed
});

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
};

export default withPWA(nextConfig);

