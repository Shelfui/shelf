import * as stylex from "@stylexjs/stylex";
import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import { Skeleton } from "./skeleton";

const meta = preview.meta({
  title: "Components/Skeleton",
  component: Skeleton,
  parameters: { figma: {} },
});

const styles = stylex.create({
  avatar: { borderRadius: "50%", height: "2.5rem", width: "2.5rem" },
  line: { height: "1rem", width: "12rem" },
  short: { height: "1rem", width: "8rem" },
});

export const Default = meta.story({
  render: () => (
    <div aria-busy="true" style={{ alignItems: "center", display: "flex", gap: 12 }}>
      <Skeleton style={styles.avatar} />
      <div style={{ display: "grid", gap: 8 }}>
        <Skeleton style={styles.line} />
        <Skeleton style={styles.short} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const skeleton of canvasElement.querySelectorAll("[data-slot=skeleton]")) {
      await expect(skeleton).toHaveAttribute("aria-hidden", "true");
    }
  },
});
