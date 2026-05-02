/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-IKENGA-Protected', value: 'TM-UJU-GROUP-LIMITED' },
          { key: 'X-Copyright', value: 'UJU GROUP LIMITED - ALL RIGHTS RESERVED' },
          { key: 'X-Trade-Secret', value: 'UJU CYCLE™ is a proprietary trade secret' },
          { key: 'Content-Security-Policy', value: "script-src 'self' 'unsafe-inline';" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
