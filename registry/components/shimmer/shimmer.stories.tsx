import * as stylex from "@stylexjs/stylex";
import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import { Shimmer } from "./shimmer";

const meta = preview.meta({
  title: "Components/Shimmer",
  component: Shimmer,
});

/** A working label. The text stays readable and the sweep is paint-only. */
export const Default = meta.story({
  render: () => <Shimmer>Thinking</Shimmer>,
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Thinking")).toBeVisible();
  },
});

export const Large = meta.story({
  render: () => <Shimmer style={styles.large}>Reading 3 files</Shimmer>,
});

const styles = stylex.create({
  large: { fontSize: "1.25rem", fontWeight: 600 },
});
