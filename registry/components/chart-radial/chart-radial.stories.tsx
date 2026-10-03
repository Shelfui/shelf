import { expect, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Chart from "../chart/chart";
import { RadialBar, RadialChart } from "./chart-radial";

const storage = [{ name: "Used", value: 72 }];
const goals = [
  { name: "Revenue", value: 72 },
  { name: "Signups", value: 54 },
  { name: "Retention", value: 88 },
];

const meta = preview.meta({
  title: "Charts/Radial Chart",
  component: RadialChart,
  parameters: { figma: {} },
  decorators: [(Story) => <div style={{ width: 320 }}>{Story()}</div>],
});

/** One ring, as progress toward 100. */
export const Default = meta.story({
  render: () => (
    <RadialChart aria-label="Storage used" data={storage} startAngle={90} endAngle={-270}>
      <RadialBar dataKey="value" name="Used" max={100} data={storage} />
    </RadialChart>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("group", { name: "Storage used" })).toBeVisible();
    await waitFor(() =>
      expect(canvasElement.querySelectorAll(".recharts-radial-bar-sector").length).toBeGreaterThan(
        0,
      ),
    );
  },
});

/** Several rings, one per item. */
export const Rings = meta.story({
  render: () => (
    <RadialChart aria-label="Goals" data={goals} startAngle={90} endAngle={-270} innerRadius="30%">
      <Chart.Tooltip />
      <RadialBar dataKey="value" max={100} data={goals} />
    </RadialChart>
  ),
});
