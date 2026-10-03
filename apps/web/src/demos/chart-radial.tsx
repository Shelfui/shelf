import * as Chart from "@/components/ui/chart";
import { RadialBar, RadialChart } from "@/components/ui/chart-radial";

const data = [
  { name: "Revenue", value: 72 },
  { name: "Signups", value: 54 },
  { name: "Retention", value: 88 },
];

export default function ChartRadialDemo() {
  return (
    <div style={{ maxWidth: "18rem", width: "100%" }}>
      <RadialChart
        aria-label="Quarterly goals"
        data={data}
        startAngle={90}
        endAngle={-270}
        innerRadius="30%"
      >
        <Chart.Tooltip />
        <RadialBar dataKey="value" max={100} data={data} />
      </RadialChart>
    </div>
  );
}
