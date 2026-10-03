import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const config: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
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

const withMDX = createMDX();

export default withMDX(config);
