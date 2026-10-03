import * as stylex from "@stylexjs/stylex";
import { colors } from "./tokens.stylex";

/**
 * Dark theme. Light is the default and needs no theme.
 *
 * Switch the whole app with `applyTheme("dark")`, so popups that render in a
 * portal, such as dialogs, get the theme too. To theme only a section, apply
 * it to that element: `<div {...stylex.props(darkTheme)}>…</div>`.
 */
export const darkTheme = stylex.createTheme(colors, {
  background: "#0a0a0a",
  foreground: "#ededed",
  card: "#111111",
  cardForeground: "#ededed",
  popover: "#171717",
  popoverForeground: "#ededed",
  primary: "#ededed",
  primaryForeground: "#0a0a0a",
  secondary: "#1f1f1f",
  secondaryForeground: "#ededed",
  muted: "#1a1a1a",
  mutedForeground: "#a1a1a1",
  accent: "#232323",
  accentForeground: "#ededed",
  destructive: "oklch(0.704 0.191 22.2)",
  destructiveForeground: "#ffffff",
  destructiveSurface: "oklch(0.53 0.22 27.3)",
  destructiveText: "oklch(0.704 0.191 22.2)",
  border: "#262626",
  input: "#333333",
  ring: "#707070",
  overlay: "rgb(0 0 0 / 60%)",
  chart1: "oklch(0.72 0.13 250)",
  chart2: "oklch(0.78 0.14 65)",
  chart3: "oklch(0.72 0.15 330)",
  chart4: "oklch(0.74 0.13 160)",
  chart5: "oklch(0.78 0.1 210)",
  chart6: "oklch(0.7 0.17 28)",
});

export type Theme = "light" | "dark";

const darkClassNames = (stylex.props(darkTheme).className ?? "").split(" ").filter(Boolean);

/**
 * Applies a theme to `root` (the whole document by default) without animating
 * controls to their new colors.
 */
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  suppressTransitions();

  for (const className of darkClassNames) root.classList.toggle(className, theme === "dark");
  root.dataset["theme"] = theme;
  root.style.colorScheme = theme;
}

/** Turns transitions off for two frames, long enough for a theme change to render. */
function suppressTransitions(): void {
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.append(style);

  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      // Resolve the new colors while transitions are still off.
      void getComputedStyle(document.body).opacity;
      style.remove();
    }),
  );
}
