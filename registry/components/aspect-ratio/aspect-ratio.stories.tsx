import * as stylex from "@stylexjs/stylex";
import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import { colors, radius, typography } from "../../foundations/tokens.stylex";
import { AspectRatio } from "./aspect-ratio";

const meta = preview.meta({
  title: "Components/AspectRatio",
  component: AspectRatio,
  parameters: { figma: {} },
});

const PHOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="#c7d2fe"/><stop offset="1" stop-color="#312e81"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/></svg>',
  );

/** The box keeps 16:9 at any width, and its content fills it. */
export const Default = meta.story({
  render: () => (
    <div {...stylex.props(styles.frame)}>
      <AspectRatio ratio={16 / 9} style={styles.surface}>
        <div {...stylex.props(styles.placeholder)}>16:9</div>
      </AspectRatio>
    </div>
  ),
  play: async ({ canvas }) => {
    const box = canvas.getByText("16:9").parentElement!;
    const { width, height } = box.getBoundingClientRect();

    await expect(width / height).toBeCloseTo(16 / 9, 1);
    await expect(canvas.getByText("16:9").getBoundingClientRect().height).toBeCloseTo(height, 0);
  },
});

/** A square image, cropped to fill the box. */
export const Image = meta.story({
  render: () => (
    <div {...stylex.props(styles.frame, styles.small)}>
      <AspectRatio ratio={1} style={styles.surface}>
        <img src={PHOTO} alt="Indigo gradient" {...stylex.props(styles.image)} />
      </AspectRatio>
    </div>
  ),
  play: async ({ canvas }) => {
    const image = canvas.getByRole("img", { name: "Indigo gradient" });
    const box = image.parentElement!.getBoundingClientRect();

    await expect(box.width).toBeCloseTo(box.height, 0);
    await expect(image.getBoundingClientRect().height).toBeCloseTo(box.height, 0);
  },
});

const styles = stylex.create({
  frame: {
    width: "24rem",
  },
  small: {
    width: "12rem",
  },
  surface: {
    borderRadius: radius.lg,
    backgroundColor: colors.muted,
  },
  placeholder: {
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: typography.fontSizeSm,
    justifyContent: "center",
  },
  image: {
    objectFit: "cover",
    height: "100%",
    width: "100%",
  },
});
