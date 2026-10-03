import * as Chart from "@/components/ui/chart";
import { Area, AreaChart } from "@/components/ui/chart-area";

const data = [
  { month: "Jan", revenue: 18600 },
  { month: "Feb", revenue: 20500 },
  { month: "Mar", revenue: 23700 },
  { month: "Apr", revenue: 22100 },
  { month: "May", revenue: 27800 },
  { month: "Jun", revenue: 31400 },
];

export default function ChartAreaDemo() {
  return (
    <div style={{ maxWidth: "36rem", width: "100%" }}>
      <AreaChart aria-label="Revenue by month" data={data}>
        <Chart.Grid />
        <Chart.XAxis dataKey="month" />
        <Chart.YAxis format={{ notation: "compact", style: "currency", currency: "USD" }} />
        <Chart.Tooltip format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />
        <Area dataKey="revenue" name="Revenue" />
      </AreaChart>
    </div>
  );
}
