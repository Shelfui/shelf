import * as Chart from "@/components/ui/chart";
import { Pie, PieChart } from "@/components/ui/chart-pie";

const data = [
  { channel: "Web", orders: 420 },
  { channel: "Store", orders: 310 },
  { channel: "Partner", orders: 215 },
  { channel: "Phone", orders: 120 },
];

export default function ChartPieDemo() {
  return (
    <div style={{ maxWidth: "22rem", width: "100%" }}>
      <PieChart aria-label="Orders by channel">
        <Chart.Tooltip />
        <Chart.Legend verticalAlign="bottom" />
        <Pie
          data={data}
          dataKey="orders"
          nameKey="channel"
          donut
          centerValue="1,065"
          centerLabel="Orders"
        />
      </PieChart>
    </div>
  );
}
