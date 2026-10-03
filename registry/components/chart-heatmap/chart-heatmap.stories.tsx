import { expect, within } from "storybook/test";
import preview from "@/.storybook/preview";
import { seriesColors } from "../chart/chart";
import { Heatmap } from "./chart-heatmap";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const hours = ["9am", "11am", "1pm", "3pm", "5pm"];
const orders = [
  [4, 12, 18, 14, 6],
  [5, 14, 22, 16, 8],
  [3, 11, 20, 19, 9],
  [6, 15, 25, 21, 10],
  [8, 18, 28, 24, 15],
];

const meta = preview.meta({
  title: "Charts/Heatmap",
  component: Heatmap,
  decorators: [(Story) => <div style={{ width: 460 }}>{Story()}</div>],
});

/** A real table: every value is readable by a screen reader, shown or not. */
export const Default = meta.story({
  args: {
    "aria-label": "Orders by weekday and hour",
    rows: days,
    columns: hours,
    values: orders,
  },
  play: async ({ canvas }) => {
    const table = canvas.getByRole("table", { name: "Orders by weekday and hour" });
    await expect(within(table).getAllByRole("row")).toHaveLength(6);
    await expect(within(table).getByRole("rowheader", { name: "Fri" })).toBeVisible();
    await expect(within(table).getAllByRole("cell", { name: "28" })).toHaveLength(1);
  },
});

export const WithValues = meta.story({
  args: {
    "aria-label": "Orders by weekday and hour, with values",
    rows: days,
    columns: hours,
    values: orders,
    showValues: true,
    color: seriesColors[3],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("28")).toBeVisible();
  },
});
