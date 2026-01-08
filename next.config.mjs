const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: isProd ? 'export' : undefined,
}

export default nextConfig
