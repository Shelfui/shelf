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
  parameters: { figma: {} },
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

const daily = [
  { date: "2026-03-01", visitors: 820 },
  { date: "2026-03-02", visitors: 932, partial: true },
  { date: "2026-03-03", visitors: 901 },
];

const monthDay = (date: string) => date.slice(5).replace("-", "/");

/** `height` sets a fixed height, a label function also formats text such as ISO dates, and `note` adds a line to the tooltip. */
export const FixedHeight = meta.story({
  render: () => (
    <LineChart aria-label="Visitors by date" data={daily} height={200}>
      <Chart.Grid />
      <Chart.XAxis dataKey="date" format={monthDay} />
      <Chart.YAxis />
      <Chart.Tooltip
        labelFormat={monthDay}
        note={(datum) => (datum["partial"] ? "Partial data" : null)}
      />
      <Line dataKey="visitors" name="Visitors" />
    </LineChart>
  ),
  play: async ({ canvas, canvasElement }) => {
    const chart = canvas.getByRole("group", { name: "Visitors by date" });

    await expect(chart.getBoundingClientRect().height).toBe(200);
    await waitFor(() => expect(canvas.getByText("03/02")).toBeVisible());

    const surface = canvasElement.querySelector(".recharts-surface");
    if (!surface) throw new Error("the chart did not render");
    const box = surface.getBoundingClientRect();
    await userEvent.pointer({
      target: surface,
      coords: { clientX: box.left + box.width / 2, clientY: box.top + box.height / 2 },
    });

    const tooltip = await waitFor(() => {
      const found = canvasElement.querySelector<HTMLElement>("[data-slot=chart-tooltip]");
      if (!found) throw new Error("the tooltip did not open");
      return found;
    });
    await expect(tooltip).toHaveTextContent("03/02");
    await expect(tooltip).toHaveTextContent("Partial data");
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
      <Line
        dataKey="signups"
        name="Signups"
        color={seriesColors[1]}
        curve="step"
        pattern="dashed"
      />
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
