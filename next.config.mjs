/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['firebase-admin'],
  allowedDevOrigins: ['192.168.4.52', '192.168.4.52:3000', 'localhost:3000'],
}

export default nextConfig
