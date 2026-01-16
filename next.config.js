/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-b150312a074447b28b7b2fe8fac4e6f5.r2.dev",
        port: "3000",
        pathname: "/api/image/**",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: false, // 307
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Referrer-Policy",
            value: "no-referrer-when-downgrade",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
