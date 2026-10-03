import { expect, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { seriesColors } from "../chart/chart";
import { Sparkline } from "./sparkline";

const weeks = [12, 14, 13, 18, 17, 22, 21, 26, 24, 31, 29, 35].map((revenue, week) => ({
  week,
  revenue,
}));

const meta = preview.meta({
  title: "Charts/Sparkline",
  component: Sparkline,
  parameters: { figma: {} },
});

/** A shape with no axes. The number goes next to it. */
export const Default = meta.story({
  args: {
    "aria-label": "Revenue, last 12 weeks",
    data: weeks,
    dataKey: "revenue",
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("img", { name: "Revenue, last 12 weeks" })).toBeVisible();
    await waitFor(() => expect(canvasElement.querySelector(".recharts-line-curve")).not.toBeNull());
  },
});

export const Colored = meta.story({
  args: {
    "aria-label": "Refunds, last 12 weeks",
    data: weeks,
    dataKey: "revenue",
    color: seriesColors[5],
    curve: "linear",
  },
});
