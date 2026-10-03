import { seriesColors } from "@/components/ui/chart";
import { Heatmap } from "@/components/ui/chart-heatmap";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const hours = ["9am", "11am", "1pm", "3pm", "5pm"];
const orders = [
  [4, 12, 18, 14, 6],
  [5, 14, 22, 16, 8],
  [3, 11, 20, 19, 9],
  [6, 15, 25, 21, 10],
  [8, 18, 28, 24, 15],
];

export default function ChartHeatmapDemo() {
  return (
    <div style={{ maxWidth: "30rem", width: "100%" }}>
      <Heatmap
        aria-label="Orders by weekday and hour"
        rows={days}
        columns={hours}
        values={orders}
        color={seriesColors[3]}
        showValues
      />
    </div>
  );
}
