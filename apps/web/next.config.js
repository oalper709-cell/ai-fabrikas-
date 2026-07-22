/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel kendi çıktısını kullanır; standalone sadece Docker/self-host için.
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),
  transpilePackages: ['@ai-fabrikasi/ui', '@ai-fabrikasi/shared'],
};

module.exports = nextConfig;
