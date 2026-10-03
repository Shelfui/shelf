import { fileURLToPath } from "node:url";
import stylex from "@stylexjs/unplugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The site is copied into every registry build, next to index.json and the item folders, so
// it uses relative URLs (any host, any base path) and keeps its assets out of item paths.
const src = fileURLToPath(new URL("src", import.meta.url));

export default defineConfig(({ command }) => ({
  base: "./",
  plugins: [stylex({ useCSSLayers: true, aliases: { "@/*": [`${src}/*`] } }), react()],
  resolve: { alias: { "@": src } },
  // In dev, serve a built registry as if the site were inside it: bun run registry:build first.
  publicDir:
    command === "serve" ? (process.env["SHELF_REGISTRY_DIR"] ?? "../../dist/registry") : false,
  build: {
    assetsDir: "_site",
    rolldownOptions: {
      onwarn(warning, warn) {
        // Base UI ships "use client" directives; they are meaningless in a client-only bundle.
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        warn(warning);
      },
    },
  },
}));
