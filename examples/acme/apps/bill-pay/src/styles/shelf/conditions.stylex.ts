import * as stylex from "@stylexjs/stylex";

/**
 * Named media queries, inlined at build time. Use them as condition keys:
 * `transitionDuration: { default: motion.durationFast, [media.reducedMotion]: "0s" }`.
 */
export const media = stylex.defineConsts({
  /** Devices with a real hover, so touch screens don't keep a stuck hover state. */
  hover: "@media (hover: hover)",
  reducedMotion: "@media (prefers-reduced-motion: reduce)",
});

/** Stacking order for layers that render in a portal. */
export const layers = stylex.defineConsts({
  overlay: "50",
  popover: "50",
  tooltip: "60",
  toast: "70",
});
