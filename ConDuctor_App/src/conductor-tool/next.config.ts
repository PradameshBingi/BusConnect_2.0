// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    '3000-firebase-busconnect2-1772532304408.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev'
  ] 
};

module.exports = nextConfig;