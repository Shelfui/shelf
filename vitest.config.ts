import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import stylex from "@stylexjs/unplugin/vite";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// Components set every transition to 0s under prefers-reduced-motion,
// so tests assert settled styles the same way on any machine.
const browser = {
  enabled: true,
  headless: true,
  provider: playwright({ contextOptions: { reducedMotion: "reduce" } }),
  instances: [{ browser: "chromium" as const }],
};

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [storybookTest({ configDir: ".storybook" })],
        test: { name: "storybook", browser },
      },
      {
        // Render-count tests for items that provide context: `registry/**/<name>.perf.tsx`.
        plugins: [stylex({ dev: true, runtimeInjection: true, devMode: "css-only" }), react()],
        // Imported only by compiled output, so Vite would find them mid-run and reload, which
        // fails the first cold-cache run. Same reason as in .storybook/main.ts.
        optimizeDeps: {
          include: [
            "@stylexjs/stylex/lib/stylex-inject",
            "embla-carousel-react",
            "react-dom/client",
          ],
        },
        test: { name: "perf", include: ["registry/**/*.perf.tsx"], browser },
      },
    ],
  },
});
