import { expect, userEvent, within } from "storybook/test";
import preview from "@/.storybook/preview";
import { AnalyticsDashboard } from "./analytics-dashboard";

const meta = preview.meta({
  title: "Blocks/Analytics Dashboard",
  component: AnalyticsDashboard,
});

/** Four figures with sparklines, then charts that each have an accessible name. */
export const Default = meta.story({
  render: () => <AnalyticsDashboard />,
  play: async ({ canvas }) => {
    const stats = canvas.getByRole("list", { name: "Key figures" });
    await expect(within(stats).getAllByRole("listitem")).toHaveLength(4);
    await expect(within(stats).getAllByRole("img")).toHaveLength(4);

    await expect(canvas.getByRole("group", { name: "Revenue and refunds by month" })).toBeVisible();
    await expect(canvas.getByRole("group", { name: "Orders by channel" })).toBeVisible();
    await expect(canvas.getByRole("table", { name: "Orders by weekday and hour" })).toBeVisible();

    // Hiding a series from the revenue legend leaves the other legends alone.
    const refunds = await canvas.findByRole("button", { name: "Refunds" });
    await userEvent.click(refunds);
    await expect(refunds).toHaveAttribute("aria-pressed", "false");
    await expect(canvas.getByRole("button", { name: "Web" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  },
});
