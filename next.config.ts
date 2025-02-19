import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.producthunt.com",
        pathname: "/widgets/embed-image/**",
      },
    ],
  },
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "Cross-Origin-Opener-Policy",
          value: "same-origin",
        },
        {
          key: "Cross-Origin-Embedder-Policy",
          value: "credentialless",
        },
        {
          key: "Cross-Origin-Resource-Policy",
          value: "cross-origin",
        },
      ],
    },
  ],
};

export default nextConfig;
