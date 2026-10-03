import { expect, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Chart from "../chart/chart";
import { seriesColors } from "../chart/chart";
import { AngleAxis, AngleGrid, Radar, RadarChart } from "./chart-radar";

const skills = [
  { skill: "Speed", team: 82, benchmark: 70 },
  { skill: "Quality", team: 91, benchmark: 78 },
  { skill: "Reach", team: 64, benchmark: 72 },
  { skill: "Cost", team: 73, benchmark: 66 },
  { skill: "Support", team: 88, benchmark: 80 },
  { skill: "Safety", team: 79, benchmark: 85 },
];

const meta = preview.meta({
  title: "Charts/Radar Chart",
  component: RadarChart,
  parameters: { figma: {} },
  decorators: [(Story) => <div style={{ width: 460 }}>{Story()}</div>],
});

export const Default = meta.story({
  render: () => (
    <RadarChart aria-label="Team against benchmark" data={skills}>
      <AngleGrid />
      <AngleAxis dataKey="skill" />
      <Chart.Tooltip />
      <Chart.Legend />
      <Radar dataKey="team" name="Team" />
      <Radar dataKey="benchmark" name="Benchmark" color={seriesColors[1]} pattern="hatch" />
    </RadarChart>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("group", { name: "Team against benchmark" })).toBeVisible();
    await waitFor(() => expect(canvasElement.querySelectorAll(".recharts-radar")).toHaveLength(2));
  },
});
