import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
          value: "require-corp",
        },
      ],
    },
  ],
};

export default nextConfig;
