import { expect, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Chart from "../chart/chart";
import { Funnel, FunnelChart } from "./chart-funnel";

const steps = [
  { step: "Visited", count: 4800 },
  { step: "Signed up", count: 2100 },
  { step: "Activated", count: 1300 },
  { step: "Subscribed", count: 480 },
];

const meta = preview.meta({
  title: "Charts/Funnel Chart",
  component: FunnelChart,
  parameters: { figma: {} },
  decorators: [(Story) => <div style={{ width: 460 }}>{Story()}</div>],
});

export const Default = meta.story({
  render: () => (
    <FunnelChart aria-label="Signup funnel">
      <Chart.Tooltip />
      <Funnel data={steps} dataKey="count" nameKey="step" />
    </FunnelChart>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("group", { name: "Signup funnel" })).toBeVisible();
    await waitFor(() =>
      expect(canvasElement.querySelectorAll(".recharts-funnel-trapezoid")).toHaveLength(4),
    );
  },
});

/** Every step's name beside its step. */
export const SideLabels = meta.story({
  render: () => (
    <FunnelChart aria-label="Signup funnel, labels beside">
      <Chart.Tooltip />
      <Funnel data={steps} dataKey="count" nameKey="step" labels="side" />
    </FunnelChart>
  ),
  play: async ({ canvasElement }) => {
    // Labels appear once the funnel has finished animating in.
    await waitFor(() =>
      expect(canvasElement.querySelectorAll("[data-slot=chart-funnel-label]")).toHaveLength(4),
    );
    const labels = [...canvasElement.querySelectorAll("[data-slot=chart-funnel-label]")];
    for (const label of labels) await expect(label).toHaveAttribute("text-anchor", "start");
  },
});
