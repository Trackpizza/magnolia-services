/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  async redirects() {
    return [
      // /services → / (homepage is the services directory)
      { source: '/services', destination: '/', permanent: false },
    ]
  },
}

export default nextConfig;
