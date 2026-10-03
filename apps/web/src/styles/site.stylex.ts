import * as stylex from "@stylexjs/stylex";

/** Page-level sizes the components never need: display type, section spacing, widths. */
export const site = stylex.defineVars({
  fontSizeXl: "1.25rem",
  lineHeightXl: "1.75rem",
  fontSize2xl: "1.5rem",
  lineHeight2xl: "2rem",
  fontSize3xl: "1.875rem",
  lineHeight3xl: "2.25rem",
  fontSize5xl: "3rem",
  lineHeight5xl: "1.05",
  space8: "2rem",
  space10: "2.5rem",
  space12: "3rem",
  space16: "4rem",
  space24: "6rem",
  headerHeight: "7.5rem",
  pageWidth: "87.5rem",
  /** Page padding at the sides. */
  gutter: { default: "1.25rem", "@media (min-width: 768px)": "3rem" },
  proseWidth: "46rem",
});

export const screens = stylex.defineConsts({
  md: "@media (min-width: 768px)",
  lg: "@media (min-width: 1024px)",
  xl: "@media (min-width: 1280px)",
});
