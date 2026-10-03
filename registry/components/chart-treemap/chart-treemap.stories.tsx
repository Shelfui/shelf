import { expect, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Chart from "../chart/chart";
import { Treemap } from "./chart-treemap";

const storage = [
  {
    name: "Media",
    children: [
      { name: "Photos", value: 420 },
      { name: "Video", value: 780 },
    ],
  },
  {
    name: "Work",
    children: [
      { name: "Docs", value: 240 },
      { name: "Design", value: 310 },
      { name: "Code", value: 150 },
    ],
  },
  { name: "Backups", value: 520 },
];

const meta = preview.meta({
  title: "Charts/Treemap",
  component: Treemap,
  parameters: { figma: {} },
  decorators: [(Story) => <div style={{ width: 560 }}>{Story()}</div>],
});

export const Default = meta.story({
  render: () => (
    <Treemap aria-label="Storage by folder" data={storage}>
      <Chart.Tooltip />
    </Treemap>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("group", { name: "Storage by folder" })).toBeVisible();
    await waitFor(() =>
      expect(canvasElement.querySelectorAll("[data-slot=chart-treemap-cell]")).toHaveLength(6),
    );
  },
});

export const Empty = meta.story({
  render: () => <Treemap aria-label="Storage by folder" data={[]} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toBeVisible();
  },
});
