import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [storybookTest({ configDir: ".storybook" })],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            // Components set every transition to 0s under prefers-reduced-motion,
            // so stories assert settled styles the same way on any machine.
            provider: playwright({ contextOptions: { reducedMotion: "reduce" } }),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
