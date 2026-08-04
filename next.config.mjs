import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  outputFileTracingIncludes: {
    '/api/**/*': ['./prisma/dev.db', './prisma/schema.prisma'],
  },
}

export default nextConfig
