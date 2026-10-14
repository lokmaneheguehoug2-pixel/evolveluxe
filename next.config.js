/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  env: {
    apiKey: process.env.apiKey,
    apiKey_2: process.env.apiKey_2,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.apiKey_2 || process.env.apiKey,
  },
};

module.exports = nextConfig;
