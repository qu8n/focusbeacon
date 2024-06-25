/* eslint-disable @typescript-eslint/no-var-requires */
const withMDX = require('@next/mdx')()

/** @type {import('next').NextConfig} */

const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/api/py/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/py/:path*"
            : "/api/py/",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/streak",
        permanent: true,
      }
    ]
  },
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
};

module.exports = withMDX(nextConfig);
