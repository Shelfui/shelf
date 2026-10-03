import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  ...(process.env["STATIC_EXPORT"] ? { output: "export", trailingSlash: true } : {}),
};

export default config;
