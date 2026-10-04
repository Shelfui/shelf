import addonA11y from "@storybook/addon-a11y";
import addonDocs from "@storybook/addon-docs";
import addonThemes, { DecoratorHelpers } from "@storybook/addon-themes";
import { definePreview } from "@storybook/react-vite";
import * as stylex from "@stylexjs/stylex";
import { configure } from "storybook/test";
import "../registry/foundations/fonts.css";
import { type Theme, applyTheme } from "../registry/foundations/themes";
import { colors, spacing, typography } from "../registry/foundations/tokens.stylex";

const DEFAULT_THEME: Theme = "light";

DecoratorHelpers.initializeThemeState(["light", "dark"], DEFAULT_THEME);

export default definePreview({
  addons: [addonDocs(), addonA11y(), addonThemes()],

  // Lazy chunks (the editor, the highlighter) take longer to arrive when many stories run at once.
  beforeAll: () => {
    configure({ asyncUtilTimeout: 5000 });
  },

  decorators: [
    (Story, context) => {
      const selected =
        context.parameters.themes?.themeOverride ?? DecoratorHelpers.pluckThemeFromContext(context);
      const theme: Theme = selected === "dark" ? "dark" : DEFAULT_THEME;

      // On <html>, so stories and their portaled popups share the theme. Applied during
      // render rather than in an effect, so play functions always see the final colors.
      if (document.documentElement.dataset["theme"] !== theme) applyTheme(theme);

      return (
        <div {...stylex.props(styles.canvas, context.viewMode === "story" && styles.fill)}>
          <Story />
        </div>
      );
    },
  ],

  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" },
  },
});

const styles = stylex.create({
  canvas: {
    fontSynthesis: "none",
    padding: spacing["6"],
    gap: spacing["3"],
    alignContent: "flex-start",
    alignItems: "center",
    backgroundColor: colors.background,
    boxSizing: "border-box",
    color: colors.foreground,
    display: "flex",
    flexWrap: "wrap",
    fontFamily: typography.fontFamily,
  },
  fill: {
    minHeight: "100vh",
  },
});
