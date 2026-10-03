import * as Chart from "@/components/ui/chart";
import { seriesColors } from "@/components/ui/chart";
import { Area, AreaChart } from "@/components/ui/chart-area";

const data = [
  { month: "Jan", visitors: 2400, signups: 320 },
  { month: "Feb", visitors: 2900, signups: 410 },
  { month: "Mar", visitors: 3300, signups: 380 },
  { month: "Apr", visitors: 3100, signups: 470 },
  { month: "May", visitors: 3900, signups: 560 },
  { month: "Jun", visitors: 4400, signups: 640 },
];

/** Every chart shares these parts: grid, axes, tooltip, and a legend that hides series. */
export default function ChartDemo() {
  return (
    <div style={{ maxWidth: "36rem", width: "100%" }}>
      <AreaChart aria-label="Visitors and signups by month" data={data}>
        <Chart.Grid />
        <Chart.XAxis dataKey="month" />
        <Chart.YAxis format={{ notation: "compact" }} />
        <Chart.Tooltip />
        <Chart.Legend />
        <Area dataKey="visitors" name="Visitors" />
        <Area dataKey="signups" name="Signups" color={seriesColors[1]} />
      </AreaChart>
    </div>
  );
}
