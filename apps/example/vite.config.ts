import stylex from "@stylexjs/unplugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [stylex({ useCSSLayers: true }), react()],
  build: {
    rolldownOptions: {
      onwarn(warning, warn) {
        // Base UI ships "use client" directives; they are meaningless in a client-only bundle.
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        warn(warning);
      },
    },
  },
});
