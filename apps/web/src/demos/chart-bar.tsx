import * as Chart from "@/components/ui/chart";
import { seriesColors } from "@/components/ui/chart";
import { Bar, BarChart } from "@/components/ui/chart-bar";

const data = [
  { channel: "Web", orders: 420, returns: 32 },
  { channel: "Store", orders: 310, returns: 24 },
  { channel: "Phone", orders: 120, returns: 9 },
  { channel: "Partner", orders: 215, returns: 18 },
];

export default function ChartBarDemo() {
  return (
    <div style={{ maxWidth: "36rem", width: "100%" }}>
      <BarChart aria-label="Orders and returns by channel" data={data}>
        <Chart.Grid />
        <Chart.XAxis dataKey="channel" />
        <Chart.YAxis />
        <Chart.Tooltip />
        <Chart.Legend />
        <Bar dataKey="orders" name="Orders" />
        <Bar dataKey="returns" name="Returns" color={seriesColors[0]} pattern="hatch" />
      </BarChart>
    </div>
  );
}
