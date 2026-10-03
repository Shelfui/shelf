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
  background: "oklch(0.145 0.004 265)",
  foreground: "oklch(0.985 0.002 265)",
  card: "oklch(0.185 0.005 265)",
  cardForeground: "oklch(0.985 0.002 265)",
  popover: "oklch(0.205 0.005 265)",
  popoverForeground: "oklch(0.985 0.002 265)",
  primary: "oklch(0.922 0.004 265)",
  primaryForeground: "oklch(0.205 0.005 265)",
  secondary: "oklch(0.269 0.006 265)",
  secondaryForeground: "oklch(0.985 0.002 265)",
  muted: "oklch(0.269 0.006 265)",
  mutedForeground: "oklch(0.72 0.008 265)",
  accent: "oklch(0.269 0.006 265)",
  accentForeground: "oklch(0.985 0.002 265)",
  destructive: "oklch(0.704 0.191 22.2)",
  destructiveForeground: "oklch(0.985 0.002 265)",
  destructiveSurface: "oklch(0.53 0.22 27.3)",
  destructiveText: "oklch(0.704 0.191 22.2)",
  border: "oklch(1 0 0 / 10%)",
  input: "oklch(1 0 0 / 15%)",
  ring: "oklch(0.556 0.008 265)",
  overlay: "oklch(0 0 0 / 60%)",
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
