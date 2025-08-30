import { NextConfig as _NextConfig } from "next"; // Import para usar en runtime

const nextConfig: _NextConfig = {
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
        permanent: false, // true si deseas redirección permanente (301)
      },
    ];
  },

  // 👇 Aquí agregamos los headers personalizados
  async headers() {
    return [
      {
        source: "/(.*)", // aplica a todas las rutas
        headers: [
          {
            key: "Referrer-Policy",
            value: "no-referrer-when-downgrade", // opción más permisiva
          },
        ],
      },
    ];
  },
};

export default nextConfig;
