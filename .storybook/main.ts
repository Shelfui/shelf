import type { StorybookConfig } from "@storybook/react-vite";
import stylex from "@stylexjs/unplugin/vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  stories: ["../registry/**/*.stories.tsx", "../packages/figma/src/*.stories.tsx"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
    "@storybook/addon-vitest",
  ],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableTelemetry: true },
  viteFinal(viteConfig) {
    // Storybook is a workshop, not a production build: inject StyleX CSS at
    // runtime so dev, `storybook build`, and Vitest browser tests all render
    // real styles without virtual-module wiring. StyleX must run before React.
    // `devMode: "off"` would disable the plugin under `vite serve` entirely.
    viteConfig.plugins = [
      stylex({ dev: true, runtimeInjection: true, devMode: "css-only" }),
      ...(viteConfig.plugins ?? []),
    ];
    // Imported only by compiled output, so Vite finds it mid-run and reloads,
    // which breaks the first cold-cache Vitest run.
    viteConfig.optimizeDeps = {
      ...viteConfig.optimizeDeps,
      include: [
        ...(viteConfig.optimizeDeps?.include ?? []),
        "@stylexjs/stylex/lib/stylex-inject",
        "@tanstack/react-table",
        "@tanstack/react-virtual",
        "embla-carousel-react",
        "react-day-picker",
        "react-dom/client",
        "react-resizable-panels",
      ],
    };
    // Base UI ships "use client" directives; they are meaningless in a client-only bundle.
    viteConfig.build = {
      ...viteConfig.build,
      rolldownOptions: {
        ...viteConfig.build?.rolldownOptions,
        onwarn(warning, warn) {
          if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
          warn(warning);
        },
      },
    };
    return mergeConfig(viteConfig, {
      resolve: { alias: { "@/.storybook": import.meta.dirname } },
    });
  },
};

export default config;
