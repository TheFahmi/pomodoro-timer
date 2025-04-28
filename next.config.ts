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
  // Fitur baru: Pengingat Kesehatan
  // healthReminders: {
  //   stretch: true, // Saran peregangan saat istirahat
  //   eyeRest: true, // Saran istirahat mata saat istirahat
  //   hydration: true // Saran hidrasi saat istirahat
  // }
  // Implementasi logika pengingat sebaiknya di komponen aplikasi.
};

export default withPWA(nextConfig);

