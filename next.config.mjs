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
      // Cherry payment plans removed (10-13, Eric: not used). The page was
      // indexed — send it, and its guide pages, to the services directory.
      {
        source: '/services/cherry-payment-plans-financing-pay-monthly-no-credit-check-burbank-ca/:path*',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

export default nextConfig;
