import { expect, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Chart from "../chart/chart";
import { SankeyChart } from "./chart-sankey";

const flow = {
  nodes: [
    { name: "Visitors" },
    { name: "Signed up" },
    { name: "Left" },
    { name: "Free" },
    { name: "Paid" },
  ],
  links: [
    { source: 0, target: 1, value: 2100 },
    { source: 0, target: 2, value: 2700 },
    { source: 1, target: 3, value: 1620 },
    { source: 1, target: 4, value: 480 },
  ],
};

const meta = preview.meta({
  title: "Charts/Sankey Chart",
  component: SankeyChart,
  parameters: { figma: {} },
  decorators: [(Story) => <div style={{ width: 600 }}>{Story()}</div>],
});

export const Default = meta.story({
  render: () => (
    <SankeyChart aria-label="Visitor flow" data={flow}>
      <Chart.Tooltip />
    </SankeyChart>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("group", { name: "Visitor flow" })).toBeVisible();
    await waitFor(() =>
      expect(canvasElement.querySelectorAll("[data-slot=chart-sankey-node]")).toHaveLength(5),
    );
    await expect(canvasElement.querySelectorAll("[data-slot=chart-sankey-link]")).toHaveLength(4);
  },
});
