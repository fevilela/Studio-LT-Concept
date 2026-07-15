import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Padrão do Next.js é 1MB — baixo demais para fotos de celular. Os uploads
      // (galeria, equipe, imagens da home) validam até 10MB no próprio código.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
