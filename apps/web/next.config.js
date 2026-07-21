/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@ai-fabrikasi/ui', '@ai-fabrikasi/shared'],
};

module.exports = nextConfig;
