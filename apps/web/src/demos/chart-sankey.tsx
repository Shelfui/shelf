import * as Chart from "@/components/ui/chart";
import { SankeyChart } from "@/components/ui/chart-sankey";

const flow = {
  nodes: [
    { name: "Visitors" },
    { name: "Signed up" },
    { name: "Left" },
    { name: "Free" },
    { name: "Paid" },
  ],
  links: [
    { source: 0, target: 1, value: 2100 },
    { source: 0, target: 2, value: 2700 },
    { source: 1, target: 3, value: 1620 },
    { source: 1, target: 4, value: 480 },
  ],
};

export default function ChartSankeyDemo() {
  return (
    <div style={{ maxWidth: "40rem", width: "100%" }}>
      <SankeyChart aria-label="Visitor flow" data={flow}>
        <Chart.Tooltip />
      </SankeyChart>
    </div>
  );
}
