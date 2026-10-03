import * as Chart from "@/components/ui/chart";
import { Funnel, FunnelChart } from "@/components/ui/chart-funnel";

const steps = [
  { step: "Visited", count: 4800 },
  { step: "Signed up", count: 2100 },
  { step: "Activated", count: 1300 },
  { step: "Subscribed", count: 480 },
];

export default function ChartFunnelDemo() {
  return (
    <div style={{ maxWidth: "28rem", width: "100%" }}>
      <FunnelChart aria-label="Signup funnel">
        <Chart.Tooltip />
        <Funnel data={steps} dataKey="count" nameKey="step" />
      </FunnelChart>
    </div>
  );
}
