import * as Chart from "@/components/ui/chart";
import { Scatter, ScatterChart, ZAxis } from "@/components/ui/chart-scatter";

const products = [
  { price: 12, rating: 3.9, sales: 420 },
  { price: 18, rating: 4.1, sales: 310 },
  { price: 25, rating: 4.4, sales: 280 },
  { price: 32, rating: 4.2, sales: 190 },
  { price: 45, rating: 4.7, sales: 120 },
  { price: 58, rating: 4.5, sales: 80 },
  { price: 70, rating: 4.8, sales: 40 },
];

export default function ChartScatterDemo() {
  return (
    <div style={{ maxWidth: "36rem", width: "100%" }}>
      <ScatterChart aria-label="Rating against price, sized by sales">
        <Chart.Grid vertical />
        <Chart.XAxis type="number" dataKey="price" name="Price" />
        <Chart.YAxis type="number" dataKey="rating" name="Rating" domain={[3, 5]} />
        <ZAxis type="number" dataKey="sales" name="Sales" range={[60, 400]} />
        <Chart.Tooltip />
        <Scatter name="Products" data={products} />
      </ScatterChart>
    </div>
  );
}
