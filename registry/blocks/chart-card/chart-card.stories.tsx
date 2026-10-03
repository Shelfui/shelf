import { expect, userEvent, waitFor } from "storybook/test";
import preview from "@/.storybook/preview";
import { ChartCard } from "./chart-card";

const meta = preview.meta({
  title: "Blocks/Chart Card",
  component: ChartCard,
  decorators: [(Story) => <div style={{ width: 640 }}>{Story()}</div>],
});

/** The range switch changes the chart and the headline figure. */
export const Default = meta.story({
  render: () => <ChartCard />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("group", { name: "Daily revenue, last 30 days" })).toBeVisible();
    const month = await canvas.findByRole("button", { name: "30 days" });
    await expect(month).toHaveAttribute("aria-pressed", "true");

    const total = canvasElement.querySelector("[data-slot=card-title]")?.textContent;
    await userEvent.click(canvas.getByRole("button", { name: "7 days" }));
    await expect(canvas.getByRole("group", { name: "Daily revenue, last 7 days" })).toBeVisible();
    await waitFor(() =>
      expect(canvasElement.querySelector("[data-slot=card-title]")?.textContent).not.toBe(total),
    );
  },
});
