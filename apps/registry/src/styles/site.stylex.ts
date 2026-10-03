import * as stylex from "@stylexjs/stylex";

/** Page-level sizes the components never need, matching the Shelf website. */
export const site = stylex.defineVars({
  fontSizeXl: "1.25rem",
  lineHeightXl: "1.75rem",
  fontSize2xl: "1.5rem",
  fontSize3xl: "1.875rem",
  fontSize5xl: "3rem",
  space8: "2rem",
  space12: "3rem",
  space16: "4rem",
  space24: "6rem",
  /** Page padding at the sides. */
  gutter: { default: "1.25rem", "@media (min-width: 768px)": "3rem" },
});

export const screens = stylex.defineConsts({
  md: "@media (min-width: 768px)",
  lg: "@media (min-width: 1024px)",
  xl: "@media (min-width: 1280px)",
});
