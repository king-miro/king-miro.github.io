const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: isProd ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  devIndicators: false,
}

export default nextConfig
