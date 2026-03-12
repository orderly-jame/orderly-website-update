import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Temporarily removing static export to enable API routes for the partnership form
  // For static hosting, consider using a serverless function or form service like Formspree
  // output: "export",
  transpilePackages: ["@mui/icons-material", "@mui/material"],
  webpack(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };
    return config;
  },
};

export default nextConfig;
