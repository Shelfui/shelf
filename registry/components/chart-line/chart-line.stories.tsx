import { expect, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Chart from "../chart/chart";
import { seriesColors } from "../chart/chart";
import { Line, LineChart } from "./chart-line";

const traffic = [
  { day: "Mon", visitors: 820, signups: 41 },
  { day: "Tue", visitors: 932, signups: 52 },
  { day: "Wed", visitors: 901, signups: 48 },
  { day: "Thu", visitors: 1134, signups: 73 },
  { day: "Fri", visitors: 1290, signups: 81 },
  { day: "Sat", visitors: 980, signups: 39 },
  { day: "Sun", visitors: 760, signups: 30 },
];

const meta = preview.meta({
  title: "Charts/Line Chart",
  component: LineChart,
  decorators: [(Story) => <div style={{ width: 560 }}>{Story()}</div>],
});

export const Default = meta.story({
  render: () => (
    <LineChart aria-label="Visitors by day" data={traffic}>
      <Chart.Grid />
      <Chart.XAxis dataKey="day" />
      <Chart.YAxis />
      <Chart.Tooltip />
      <Line dataKey="visitors" name="Visitors" />
    </LineChart>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("group", { name: "Visitors by day" })).toBeVisible();
    await waitFor(() => expect(canvasElement.querySelector(".recharts-line-curve")).not.toBeNull());
  },
});

/** Several series, with a legend that hides and shows them. */
export const WithLegend = meta.story({
  render: () => (
    <LineChart aria-label="Visitors and signups" data={traffic}>
      <Chart.Grid />
      <Chart.XAxis dataKey="day" />
      <Chart.YAxis />
      <Chart.Tooltip />
      <Chart.Legend />
      <Line dataKey="visitors" name="Visitors" />
      <Line dataKey="signups" name="Signups" color={seriesColors[3]} curve="step" />
    </LineChart>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelectorAll(".recharts-line-curve")).toHaveLength(2);
    await userEvent.click(await canvas.findByRole("button", { name: "Signups" }));
    await waitFor(() =>
      expect(canvasElement.querySelectorAll(".recharts-line-curve")).toHaveLength(1),
    );
  },
});
