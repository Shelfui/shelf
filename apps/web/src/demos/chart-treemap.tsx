import * as Chart from "@/components/ui/chart";
import { Treemap } from "@/components/ui/chart-treemap";

const storage = [
  {
    name: "Media",
    children: [
      { name: "Photos", value: 420 },
      { name: "Video", value: 780 },
    ],
  },
  {
    name: "Work",
    children: [
      { name: "Docs", value: 240 },
      { name: "Design", value: 310 },
      { name: "Code", value: 150 },
    ],
  },
  { name: "Backups", value: 520 },
];

export default function ChartTreemapDemo() {
  return (
    <div style={{ maxWidth: "36rem", width: "100%" }}>
      <Treemap aria-label="Storage by folder" data={storage}>
        <Chart.Tooltip />
      </Treemap>
    </div>
  );
}
