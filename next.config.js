/** @type {import('next').NextConfig} */

function getImageRemotePatterns() {
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  if (!base) {
    return [
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
    ];
  }

  try {
    const url = new URL(base);
    return [
      {
        protocol: url.protocol.replace(":", ""),
        hostname: url.hostname,
        pathname: "/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["http://127.0.0.1:3000"],

  images: {
    remotePatterns: getImageRemotePatterns(),
  },

  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: false,
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
