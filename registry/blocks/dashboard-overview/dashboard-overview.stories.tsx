import { expect, within } from "storybook/test";
import preview from "@/.storybook/preview";
import { DashboardOverview } from "./dashboard-overview";

const meta = preview.meta({
  title: "Blocks/Dashboard Overview",
  component: DashboardOverview,
  parameters: { figma: { fill: true } },
});

/** Stats are a labelled list, goals are progress bars, and recent invoices are a named table. */
export const Default = meta.story({
  render: () => <DashboardOverview />,
  play: async ({ canvas }) => {
    const stats = canvas.getByRole("list", { name: "Key figures" });
    await expect(within(stats).getAllByRole("listitem")).toHaveLength(4);

    await expect(canvas.getAllByRole("progressbar")).toHaveLength(3);
    await expect(canvas.getByRole("progressbar", { name: "Quarterly revenue" })).toHaveAttribute(
      "aria-valuenow",
      "72",
    );

    await expect(canvas.getByRole("group", { name: "Revenue by month" })).toBeVisible();

    const table = canvas.getByRole("table", { name: "Recent invoices" });
    await expect(within(table).getAllByRole("row")).toHaveLength(6);
  },
});
