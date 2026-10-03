import * as Chart from "@/components/ui/chart";
import { seriesColors } from "@/components/ui/chart";
import { AngleAxis, AngleGrid, Radar, RadarChart } from "@/components/ui/chart-radar";

const data = [
  { skill: "Speed", team: 82, benchmark: 70 },
  { skill: "Quality", team: 91, benchmark: 78 },
  { skill: "Reach", team: 64, benchmark: 72 },
  { skill: "Cost", team: 73, benchmark: 66 },
  { skill: "Support", team: 88, benchmark: 80 },
  { skill: "Safety", team: 79, benchmark: 85 },
];

export default function ChartRadarDemo() {
  return (
    <div style={{ maxWidth: "26rem", width: "100%" }}>
      <RadarChart aria-label="Team against benchmark" data={data}>
        <AngleGrid />
        <AngleAxis dataKey="skill" />
        <Chart.Tooltip />
        <Chart.Legend verticalAlign="bottom" />
        <Radar dataKey="team" name="Team" />
        <Radar dataKey="benchmark" name="Benchmark" color={seriesColors[1]} />
      </RadarChart>
    </div>
  );
}
