/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: { forceSwcTransforms: true }
};
module.exports = nextConfig;
