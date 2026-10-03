import { expect, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Chart from "../chart/chart";
import { seriesColors } from "../chart/chart";
import { Area, AreaChart } from "./chart-area";

const revenue = [
  { month: "Jan", revenue: 18600, refunds: 1200 },
  { month: "Feb", revenue: 20500, refunds: 1500 },
  { month: "Mar", revenue: 23700, refunds: 900 },
  { month: "Apr", revenue: 22100, refunds: 1800 },
  { month: "May", revenue: 27800, refunds: 1100 },
  { month: "Jun", revenue: 31400, refunds: 1400 },
];

const USD = { style: "currency", currency: "USD", maximumFractionDigits: 0 } as const;

const meta = preview.meta({
  title: "Charts/Area Chart",
  component: AreaChart,
  parameters: { figma: {} },
  decorators: [(Story) => <div style={{ width: 560 }}>{Story()}</div>],
});

/** One series. Hover or press the arrow keys on the chart to read a value. */
export const Default = meta.story({
  render: () => (
    <AreaChart aria-label="Revenue by month" data={revenue}>
      <Chart.Grid />
      <Chart.XAxis dataKey="month" />
      <Chart.YAxis format={{ notation: "compact", style: "currency", currency: "USD" }} />
      <Chart.Tooltip format={USD} />
      <Area dataKey="revenue" name="Revenue" />
    </AreaChart>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("group", { name: "Revenue by month" })).toBeVisible();
    await waitFor(() => expect(canvasElement.querySelector(".recharts-area-curve")).not.toBeNull());
    await expect(
      canvasElement.querySelectorAll(".recharts-xAxis .recharts-cartesian-axis-tick"),
    ).toHaveLength(6);
  },
});

/** Two series with a legend. Pressing a legend item hides its series. */
export const WithLegend = meta.story({
  render: () => (
    <AreaChart aria-label="Revenue and refunds" data={revenue}>
      <Chart.Grid />
      <Chart.XAxis dataKey="month" />
      <Chart.YAxis format={{ notation: "compact" }} />
      <Chart.Tooltip format={USD} />
      <Chart.Legend />
      <Area dataKey="revenue" name="Revenue" />
      <Area dataKey="refunds" name="Refunds" color={seriesColors[1]} pattern="dots" />
    </AreaChart>
  ),
  play: async ({ canvas, canvasElement }) => {
    const revenueToggle = await canvas.findByRole("button", { name: "Revenue" });
    await expect(revenueToggle).toHaveAttribute("aria-pressed", "true");
    await expect(canvasElement.querySelectorAll(".recharts-area-curve")).toHaveLength(2);

    await userEvent.click(revenueToggle);
    await expect(revenueToggle).toHaveAttribute("aria-pressed", "false");
    await waitFor(() =>
      expect(canvasElement.querySelectorAll(".recharts-area-curve")).toHaveLength(1),
    );
  },
});

/** Stacked series add up to a total. */
export const Stacked = meta.story({
  render: () => (
    <AreaChart aria-label="Revenue and refunds, stacked" data={revenue}>
      <Chart.Grid />
      <Chart.XAxis dataKey="month" />
      <Chart.YAxis format={{ notation: "compact" }} />
      <Chart.Tooltip format={USD} />
      <Area dataKey="revenue" name="Revenue" stacked />
      <Area dataKey="refunds" name="Refunds" color={seriesColors[1]} pattern="dots" stacked />
    </AreaChart>
  ),
});

/** Numbers print in the chart's `locale`. */
export const Locale = meta.story({
  render: () => (
    <AreaChart aria-label="Intäkter per månad" data={revenue} locale="sv-SE">
      <Chart.Grid />
      <Chart.XAxis dataKey="month" />
      <Chart.YAxis format={{ style: "currency", currency: "SEK", maximumFractionDigits: 0 }} />
      <Chart.Tooltip format={{ style: "currency", currency: "SEK", maximumFractionDigits: 0 }} />
      <Area dataKey="revenue" name="Intäkter" />
    </AreaChart>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.textContent).toContain("kr"));
  },
});

/** With no data, the chart says so instead of drawing empty axes. */
export const Empty = meta.story({
  render: () => (
    <AreaChart aria-label="Revenue by month" data={[]}>
      <Area dataKey="revenue" />
    </AreaChart>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent("No data to show.");
  },
});
