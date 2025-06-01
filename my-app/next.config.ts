/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['hmguenmvvggchxtszojj.supabase.co'],
    // Or use the newer remotePatterns (recommended)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hmguenmvvggchxtszojj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig