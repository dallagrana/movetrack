import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Allow Server Actions from both localhost and LAN IP access
      allowedOrigins: ['localhost:3000', '192.168.178.191:3000'],
    },
  },
}

export default withPWA(nextConfig)
