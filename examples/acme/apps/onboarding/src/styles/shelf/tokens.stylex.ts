import * as stylex from "@stylexjs/stylex";

/**
 * Semantic colors. Each surface token pairs with a `*Foreground` token for the
 * text and icons on it. Light values are the default; see `themes.ts` for dark.
 */
export const colors = stylex.defineVars({
  background: "oklch(1 0 0)",
  foreground: "oklch(0.145 0.004 265)",
  card: "oklch(1 0 0)",
  cardForeground: "oklch(0.145 0.004 265)",
  popover: "oklch(1 0 0)",
  popoverForeground: "oklch(0.145 0.004 265)",
  primary: "oklch(0.205 0.005 265)",
  primaryForeground: "oklch(0.985 0.002 265)",
  secondary: "oklch(0.967 0.003 265)",
  secondaryForeground: "oklch(0.205 0.005 265)",
  muted: "oklch(0.967 0.003 265)",
  /** 4.5:1 against `background`, `card`, and `muted`. */
  mutedForeground: "oklch(0.51 0.008 265)",
  accent: "oklch(0.967 0.003 265)",
  accentForeground: "oklch(0.205 0.005 265)",
  destructive: "oklch(0.577 0.245 27.3)",
  destructiveForeground: "oklch(0.985 0.002 265)",
  /** Filled destructive controls; darker than `destructive` to keep 4.5:1 text contrast. */
  destructiveSurface: "oklch(0.53 0.22 27.3)",
  /** Error messages; 4.5:1 against both `background` and `card`. */
  destructiveText: "oklch(0.5 0.2 27.3)",
  border: "oklch(0.922 0.004 265)",
  input: "oklch(0.922 0.004 265)",
  ring: "oklch(0.708 0.006 265)",
  /** Covers the page behind modal surfaces such as dialogs. */
  overlay: "oklch(0 0 0 / 40%)",
});

/** Load the typefaces with `fonts.css`. */
export const typography = stylex.defineVars({
  fontFamily: '"Geist Variable", ui-sans-serif, system-ui, sans-serif',
  /** Code, keyboard keys, and one-time codes. */
  fontFamilyMono: '"Geist Mono Variable", ui-monospace, SFMono-Regular, Menlo, monospace',
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
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  full: "9999px",
});

export const elevation = stylex.defineVars({
  none: "none",
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
});

export const motion = stylex.defineVars({
  durationFast: "150ms",
  /** Panels that travel across the screen, such as drawers. */
  durationSlow: "300ms",
  easingStandard: "cubic-bezier(0.4, 0, 0.2, 1)",
});

/** Control heights shared by interactive components. */
export const sizes = stylex.defineVars({
  controlXs: "1.5rem",
  controlSm: "1.75rem",
  controlDefault: "2rem",
  controlLg: "2.25rem",
});
