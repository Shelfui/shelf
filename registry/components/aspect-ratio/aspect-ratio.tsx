import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import type { Styled } from "../../lib/utils";

export type AspectRatioProps = Styled<ComponentProps<"div">> & {
  /** Width divided by height, such as `16 / 9`. */
  ratio?: number;
};

/**
 * A box that keeps its width-to-height ratio as it resizes: `<AspectRatio ratio={16 / 9}>`.
 * Its content fills it. An `<img>` or `<video>` also needs `width` and `height` of `100%`
 * and an `objectFit`.
 */
export function AspectRatio({ ratio = 1, style, ...props }: AspectRatioProps) {
  return (
    <div
      data-slot="aspect-ratio"
      {...props}
      {...stylex.props(styles.root, styles.ratio(ratio), style)}
    />
  );
}

const styles = stylex.create({
  root: {
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "100%",
    gridTemplateRows: "100%",
    position: "relative",
    width: "100%",
  },
  ratio: (ratio: number) => ({
    aspectRatio: ratio,
  }),
});
