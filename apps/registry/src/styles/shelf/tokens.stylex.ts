import * as stylex from "@stylexjs/stylex";

/**
 * Semantic colors. Each surface token pairs with a `*Foreground` token for the
 * text and icons on it. Light values are the default; see `themes.ts` for dark.
 */
export const colors = stylex.defineVars({
  background: "#ffffff",
  foreground: "#0a0a0a",
  card: "#fafafa",
  cardForeground: "#0a0a0a",
  popover: "#ffffff",
  popoverForeground: "#0a0a0a",
  primary: "#171717",
  primaryForeground: "#ffffff",
  secondary: "#f2f2f2",
  secondaryForeground: "#0a0a0a",
  muted: "#f2f2f2",
  /** 4.5:1 against `background`, `card`, and `muted`. */
  mutedForeground: "#666666",
  accent: "#ebebeb",
  accentForeground: "#0a0a0a",
  destructive: "oklch(0.577 0.245 27.3)",
  destructiveForeground: "#ffffff",
  /** Filled destructive controls; darker than `destructive` to keep 4.5:1 text contrast. */
  destructiveSurface: "oklch(0.53 0.22 27.3)",
  /** Error messages; 4.5:1 against both `background` and `card`. */
  destructiveText: "oklch(0.5 0.2 27.3)",
  border: "#eaeaea",
  input: "#e0e0e0",
  ring: "#8f8f8f",
  /** Covers the page behind modal surfaces such as dialogs. */
  overlay: "rgb(0 0 0 / 40%)",
  /**
   * Data series, in order: blue, orange, purple, green, cyan, red. Distinguishable with common
   * color vision deficiencies, and 3:1 against `background` and `card`.
   */
  chart1: "oklch(0.55 0.15 250)",
  chart2: "oklch(0.62 0.16 55)",
  chart3: "oklch(0.55 0.17 330)",
  chart4: "oklch(0.56 0.12 160)",
  chart5: "oklch(0.58 0.1 210)",
  chart6: "oklch(0.56 0.19 28)",
});

/**
 * Typefaces. `fonts.css` loads the defaults. To use your own, define `--font-sans` and
 * `--font-mono` (with next/font: `variable: "--font-sans"`), or edit these two values.
 */
export const typography = stylex.defineVars({
  fontFamily: 'var(--font-sans, "Geist Variable"), ui-sans-serif, system-ui, sans-serif',
  /** Code, keyboard keys, and one-time codes. */
  fontFamilyMono:
    'var(--font-mono, "Geist Mono Variable"), ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSizeXs: "0.75rem",
  lineHeightXs: "1rem",
  fontSizeSm: "0.875rem",
  lineHeightSm: "1.25rem",
  fontSizeBase: "1rem",
  lineHeightBase: "1.5rem",
  fontSizeLg: "1.125rem",
  lineHeightLg: "1.75rem",
  // Components set `fontSynthesis: "none"`, so a typeface without a weight never renders a faux bold.
  fontWeightRegular: "400",
  fontWeightMedium: "500",
  fontWeightSemibold: "600",
});

/** A 0.25rem scale keyed by multiples, so `2.5` is 0.625rem. */
export const spacing = stylex.defineVars({
  "1": "0.25rem",
  "1.5": "0.375rem",
  "2": "0.5rem",
  "2.5": "0.625rem",
  "3": "0.75rem",
  "4": "1rem",
  "6": "1.5rem",
});

/** `sm` for small parts such as checkboxes and menu items, `md` for controls, `lg` for surfaces. */
export const radius = stylex.defineVars({
  none: "0",
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.625rem",
  full: "9999px",
});

export const elevation = stylex.defineVars({
  none: "none",
  xs: "0 1px 1px 0 rgb(0 0 0 / 0.04)",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.06), 0 1px 1px -1px rgb(0 0 0 / 0.04)",
  lg: "0 8px 24px -6px rgb(0 0 0 / 0.16), 0 2px 6px -2px rgb(0 0 0 / 0.08)",
});

export const motion = stylex.defineVars({
  durationFast: "150ms",
  /** Panels that travel across the screen, such as drawers. */
  durationSlow: "300ms",
  easingStandard: "cubic-bezier(0.4, 0, 0.2, 1)",
  /** Fast out, soft landing: things that arrive, such as toasts. */
  easingOut: "cubic-bezier(0.22, 1, 0.36, 1)",
});

/** Control heights shared by interactive components. */
export const sizes = stylex.defineVars({
  controlXs: "1.5rem",
  controlSm: "1.75rem",
  controlDefault: "2rem",
  controlLg: "2.25rem",
});
