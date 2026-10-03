import { expect, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Chart from "../chart/chart";
import { Pie, PieChart } from "./chart-pie";

const channels = [
  { channel: "Web", orders: 420 },
  { channel: "Store", orders: 310 },
  { channel: "Partner", orders: 215 },
  { channel: "Phone", orders: 120 },
];

const meta = preview.meta({
  title: "Charts/Pie Chart",
  component: PieChart,
  decorators: [(Story) => <div style={{ width: 420 }}>{Story()}</div>],
});

export const Default = meta.story({
  render: () => (
    <PieChart aria-label="Orders by channel">
      <Chart.Tooltip />
      <Pie data={channels} dataKey="orders" nameKey="channel" />
    </PieChart>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("group", { name: "Orders by channel" })).toBeVisible();
    await waitFor(() =>
      expect(canvasElement.querySelectorAll(".recharts-pie-sector")).toHaveLength(4),
    );
  },
});

/** A donut with the total in the middle, and a legend that hides slices. */
export const Donut = meta.story({
  render: () => (
    <PieChart aria-label="Orders by channel, donut">
      <Chart.Tooltip />
      <Chart.Legend verticalAlign="bottom" />
      <Pie
        data={channels}
        dataKey="orders"
        nameKey="channel"
        donut
        centerValue="1,065"
        centerLabel="Orders"
      />
    </PieChart>
  ),
  play: async ({ canvas, canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector("[data-slot=chart-center]")).not.toBeNull(),
    );
    await expect(canvasElement.querySelector("[data-slot=chart-center]")).toHaveTextContent(
      "1,065Orders",
    );

    const phone = await canvas.findByRole("button", { name: "Phone" });
    await expect(phone).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(phone);
    await expect(phone).toHaveAttribute("aria-pressed", "false");
    // The hidden slice stays in the legend so it can come back.
    await expect(canvas.getAllByRole("button")).toHaveLength(4);
  },
});
