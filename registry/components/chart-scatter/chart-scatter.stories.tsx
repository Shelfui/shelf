import { expect, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import * as Chart from "../chart/chart";
import { seriesColors } from "../chart/chart";
import { Scatter, ScatterChart, ZAxis } from "./chart-scatter";

const products = [
  { price: 12, rating: 3.9, sales: 420 },
  { price: 18, rating: 4.1, sales: 310 },
  { price: 25, rating: 4.4, sales: 280 },
  { price: 32, rating: 4.2, sales: 190 },
  { price: 45, rating: 4.7, sales: 120 },
  { price: 58, rating: 4.5, sales: 80 },
  { price: 70, rating: 4.8, sales: 40 },
];

const meta = preview.meta({
  title: "Charts/Scatter Chart",
  component: ScatterChart,
  decorators: [(Story) => <div style={{ width: 560 }}>{Story()}</div>],
});

export const Default = meta.story({
  render: () => (
    <ScatterChart aria-label="Rating against price">
      <Chart.Grid vertical />
      <Chart.XAxis
        type="number"
        dataKey="price"
        name="Price"
        format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
      />
      <Chart.YAxis type="number" dataKey="rating" name="Rating" domain={[3, 5]} />
      <Chart.Tooltip />
      <Scatter name="Products" data={products} />
    </ScatterChart>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("group", { name: "Rating against price" })).toBeVisible();
    await waitFor(() =>
      expect(canvasElement.querySelectorAll(".recharts-scatter-symbol")).toHaveLength(7),
    );
  },
});

/** A third measure sizes the dots. */
export const Bubbles = meta.story({
  render: () => (
    <ScatterChart aria-label="Rating against price, sized by sales">
      <Chart.Grid vertical />
      <Chart.XAxis type="number" dataKey="price" name="Price" />
      <Chart.YAxis type="number" dataKey="rating" name="Rating" domain={[3, 5]} />
      <ZAxis type="number" dataKey="sales" name="Sales" range={[60, 400]} />
      <Chart.Tooltip />
      <Scatter name="Products" data={products} color={seriesColors[2]} />
    </ScatterChart>
  ),
});
