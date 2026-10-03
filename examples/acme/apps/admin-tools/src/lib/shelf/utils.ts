import type * as stylex from "@stylexjs/stylex";

/**
 * A part's props, with StyleX overrides in `style` applied after the part's own styles.
 * `className` and inline `style` are not accepted: pass `stylex.create` styles, or edit the part.
 */
export type Styled<Props> = Omit<Props, "className" | "style"> & { style?: stylex.StaticStyles };

/** The placement props of a Base UI positioner, for parts that render one internally. */
export type Placement<PositionerProps extends PlacementKeys> = Pick<
  PositionerProps,
  keyof PlacementKeys
>;

interface PlacementKeys {
  align?: unknown;
  alignOffset?: unknown;
  side?: unknown;
  sideOffset?: unknown;
}

/** Base UI's enter and exit frames, which animate from and to the hidden styles. */
export function isTransitioning(state: { transitionStatus?: string | undefined }): boolean {
  return state.transitionStatus === "starting" || state.transitionStatus === "ending";
}

/** ARIA boolean attributes arrive as `true` or `"true"`. */
export function isAriaTrue(value: unknown): boolean {
  return value === true || value === "true";
}
