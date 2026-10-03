import { Sparkline } from "@/components/ui/sparkline";

const weeks = [12, 14, 13, 18, 17, 22, 21, 26, 24, 31, 29, 35].map((revenue, week) => ({
  week,
  revenue,
}));

export default function SparklineDemo() {
  return (
    <div style={{ alignItems: "center", display: "flex", gap: "1rem" }}>
      <span>$35,000</span>
      <Sparkline aria-label="Revenue, last 12 weeks" data={weeks} dataKey="revenue" />
    </div>
  );
}
