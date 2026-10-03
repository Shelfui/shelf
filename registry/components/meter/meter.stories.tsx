import { expect } from "storybook/test";
import preview from "@/.storybook/preview";
import { Meter } from "./meter";

const meta = preview.meta({
  title: "Components/Meter",
  component: Meter,
  decorators: [(Story) => <div style={{ width: 320 }}>{Story()}</div>],
  parameters: { figma: {} },
});

export const Default = meta.story({
  args: { label: "Storage used", showValue: true, value: 72 },
  play: async ({ canvas, canvasElement }) => {
    const meter = canvas.getByRole("meter", { name: "Storage used" });
    const track = canvasElement.querySelector("[data-slot=meter-track]")!;
    const indicator = canvasElement.querySelector("[data-slot=meter-indicator]")!;

    await expect(meter).toHaveAttribute("aria-valuenow", "72");
    await expect(canvas.getByText("72%")).toBeVisible();
    await expect(indicator.getBoundingClientRect().width).toBeCloseTo(
      track.getBoundingClientRect().width * 0.72,
      0,
    );
  },
});

export const CurrencyFormat = meta.story({
  args: {
    label: "Credit limit used",
    showValue: true,
    value: 1800,
    max: 5000,
    format: { style: "currency", currency: "USD", maximumFractionDigits: 0 },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("$1,800")).toBeVisible();
  },
});
