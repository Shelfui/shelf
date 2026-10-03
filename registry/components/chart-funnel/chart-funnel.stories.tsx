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
