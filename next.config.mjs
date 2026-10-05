/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  async redirects() {
    return [
      // /services → / (homepage is the services directory)
      { source: '/services', destination: '/', permanent: false },
      // /booking is the booking page (10-04). /bookings is printed on flyers
      // and on the Google Business Profile, so it must keep working forever;
      // /bookingpreview was the hidden staging copy. Exact paths only —
      // /bookings/manage and /bookings/cancel are real pages that emails link.
      { source: '/bookings', destination: '/booking', permanent: true },
      { source: '/bookingpreview', destination: '/booking', permanent: true },
    ]
  },
}

export default nextConfig;
