import * as Chart from "@/components/ui/chart";
import { seriesColors } from "@/components/ui/chart";
import { Line, LineChart } from "@/components/ui/chart-line";

const data = [
  { day: "Mon", visitors: 820, signups: 41 },
  { day: "Tue", visitors: 932, signups: 52 },
  { day: "Wed", visitors: 901, signups: 48 },
  { day: "Thu", visitors: 1134, signups: 73 },
  { day: "Fri", visitors: 1290, signups: 81 },
  { day: "Sat", visitors: 980, signups: 39 },
  { day: "Sun", visitors: 760, signups: 30 },
];

export default function ChartLineDemo() {
  return (
    <div style={{ maxWidth: "36rem", width: "100%" }}>
      <LineChart aria-label="Visitors and signups by day" data={data}>
        <Chart.Grid />
        <Chart.XAxis dataKey="day" />
        <Chart.YAxis />
        <Chart.Tooltip />
        <Chart.Legend />
        <Line dataKey="visitors" name="Visitors" />
        <Line dataKey="signups" name="Signups" color={seriesColors[1]} pattern="dashed" />
      </LineChart>
    </div>
  );
}
