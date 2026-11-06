/** @type {import('next').NextConfig} */

module.exports = {
  images: {
    loader: 'custom',
    loaderFile: './lib/sanityImageLoader.js',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async redirects() {
    return [
      {
        // Google had picked the Vercel address as the canonical home page, so
        // send it (permanently) to the real domain. API routes are excluded so
        // webhooks and draft-mode links keep working there. Preview
        // deployments (other *.vercel.app hosts) are left alone and noindexed.
        source: "/:path((?!api/).*)",
        has: [{ type: "host", value: "roberta-personal-site-v2.vercel.app" }],
        destination: "https://www.robertamascotto.com/:path",
        permanent: true,
      },
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
        // Keep Vercel's own addresses (the production alias and every
        // preview deployment) out of Google so they can't show up as
        // duplicates of www.robertamascotto.com.
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
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
