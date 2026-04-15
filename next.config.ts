import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: "export",
  assetPrefix: isProd ? "./" : undefined,
  
  reactCompiler: true,
  
  images: {
    unoptimized: true,
  },

  devIndicators: {
    position: "bottom-left",
  },
};

export default nextConfig;