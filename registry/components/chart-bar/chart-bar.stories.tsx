import { expect, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Chart from "../chart/chart";
import { seriesColors } from "../chart/chart";
import { Bar, BarChart } from "./chart-bar";

const orders = [
  { channel: "Web", orders: 420, returns: 32 },
  { channel: "Store", orders: 310, returns: 24 },
  { channel: "Phone", orders: 120, returns: 9 },
  { channel: "Partner", orders: 215, returns: 18 },
];

const meta = preview.meta({
  title: "Charts/Bar Chart",
  component: BarChart,
  parameters: { figma: {} },
  decorators: [(Story) => <div style={{ width: 560 }}>{Story()}</div>],
});

export const Default = meta.story({
  render: () => (
    <BarChart aria-label="Orders by channel" data={orders}>
      <Chart.Grid />
      <Chart.XAxis dataKey="channel" />
      <Chart.YAxis />
      <Chart.Tooltip />
      <Bar dataKey="orders" name="Orders" />
    </BarChart>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("group", { name: "Orders by channel" })).toBeVisible();
    await waitFor(() =>
      expect(canvasElement.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(4),
    );
  },
});

/** Two series side by side, with a legend. */
export const Grouped = meta.story({
  render: () => (
    <BarChart aria-label="Orders and returns by channel" data={orders}>
      <Chart.Grid />
      <Chart.XAxis dataKey="channel" />
      <Chart.YAxis />
      <Chart.Tooltip />
      <Chart.Legend />
      <Bar dataKey="orders" name="Orders" />
      <Bar dataKey="returns" name="Returns" color={seriesColors[0]} pattern="hatch" />
    </BarChart>
  ),
  play: async ({ canvas, canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(8),
    );
    await userEvent.click(await canvas.findByRole("button", { name: "Returns" }));
    await waitFor(() =>
      expect(canvasElement.querySelectorAll(".recharts-bar-rectangle")).toHaveLength(4),
    );
  },
});

export const Stacked = meta.story({
  render: () => (
    <BarChart aria-label="Orders and returns, stacked" data={orders}>
      <Chart.Grid />
      <Chart.XAxis dataKey="channel" />
      <Chart.YAxis />
      <Chart.Tooltip />
      <Bar dataKey="orders" name="Orders" stacked />
      <Bar dataKey="returns" name="Returns" color={seriesColors[1]} stacked />
    </BarChart>
  ),
});

/** Long category names read better on the vertical axis. */
export const Horizontal = meta.story({
  render: () => (
    <BarChart aria-label="Orders by channel, horizontal" data={orders} layout="vertical">
      <Chart.Grid horizontal={false} vertical />
      <Chart.XAxis type="number" />
      <Chart.YAxis type="category" dataKey="channel" width={64} />
      <Chart.Tooltip />
      <Bar dataKey="orders" name="Orders" />
    </BarChart>
  ),
});

export const Empty = meta.story({
  render: () => (
    <BarChart aria-label="Orders by channel" data={[]}>
      <Bar dataKey="orders" />
    </BarChart>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toBeVisible();
  },
});
