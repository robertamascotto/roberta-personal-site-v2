/** @type {import('next').NextConfig} */

module.exports = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async redirects() {
    return [
      { source: "/e-commerce", destination: "/products", permanent: true },
      { source: "/campaigns", destination: "/products", permanent: true },
      { source: "/branded-content", destination: "/editorials", permanent: true },
      { source: "/portfolio", destination: "/", permanent: true },
      { source: "/portfolio/:category", destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
}
