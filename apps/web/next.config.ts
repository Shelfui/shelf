import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Next's bundled polyfills (Array.prototype.at, Object.fromEntries, ...) are native in the browserslist targets.
  turbopack: {
    resolveAlias: {
      "../build/polyfills/polyfill-module": "./src/lib/empty-polyfill.js",
      "next/dist/build/polyfills/polyfill-module": "./src/lib/empty-polyfill.js",
    },
  },
  ...(process.env["STATIC_EXPORT"] ? { output: "export", trailingSlash: true } : {}),
};

export default config;
