import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import preview from "@/.storybook/preview";
import { type Invoice, InvoicesTable } from "./invoices-table";

const meta = preview.meta({
  title: "Blocks/Invoices Table",
  component: InvoicesTable,
  // Menus and the status list render in a portal on <body>.
  parameters: { figma: { fill: true }, a11y: { context: "body" } },
});

const INVOICES: Invoice[] = [
  { id: "INV-1042", customer: "Soylent", amount: 1200, status: "paid", dueDate: "2026-08-14" },
  { id: "INV-1043", customer: "Globex", amount: 860, status: "pending", dueDate: "2026-09-30" },
  { id: "INV-1044", customer: "Initech", amount: 2450, status: "overdue", dueDate: "2026-09-01" },
  { id: "INV-1045", customer: "Umbrella", amount: 640, status: "paid", dueDate: "2026-08-28" },
  { id: "INV-1046", customer: "Hooli", amount: 3100, status: "pending", dueDate: "2026-10-12" },
  {
    id: "INV-1047",
    customer: "Stark Industries",
    amount: 5400,
    status: "paid",
    dueDate: "2026-09-18",
  },
  {
    id: "INV-1048",
    customer: "Wayne Enterprises",
    amount: 980,
    status: "overdue",
    dueDate: "2026-08-30",
  },
  { id: "INV-1049", customer: "Globex", amount: 1750, status: "draft", dueDate: "2026-10-20" },
];

const created = fn();

/** The customers in the table body, top to bottom. */
const customers = (canvas: HTMLElement) =>
  within(within(canvas).getByRole("table", { name: "Invoices" }))
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[2]!.textContent);

/** Tabs count each status; the first page shows five invoices, and the total covers all of them. */
export const Default = meta.story({
  render: () => <InvoicesTable invoices={INVOICES} onCreate={created} />,
  play: async ({ canvas, canvasElement }) => {
    created.mockClear();

    await expect(customers(canvasElement)).toHaveLength(5);
    await expect(canvas.getByRole("tab", { name: "Overdue 2" })).toBeVisible();
    await expect(canvas.getByText("$16,380.00")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Actions for INV-1044" }));
    const voidItem = await screen.findByRole("menuitem", { name: "Void invoice" });
    await waitFor(() => expect(voidItem).toBeVisible());
    await userEvent.keyboard("{Escape}");

    await userEvent.click(canvas.getByRole("button", { name: "New invoice" }));
    await expect(created).toHaveBeenCalledTimes(1);
  },
});

/** A status tab and search narrow the rows; with no matches, Clear filters restores them. */
export const Filtered = meta.story({
  render: () => <InvoicesTable invoices={INVOICES} />,
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Pending 2" }));
    await waitFor(() => expect(customers(canvasElement)).toEqual(["Globex", "Hooli"]));
    await expect(canvas.getByText("$3,960.00")).toBeVisible();

    await userEvent.type(canvas.getByRole("searchbox", { name: "Search invoices" }), "hoo");
    await waitFor(() => expect(customers(canvasElement)).toEqual(["Hooli"]));
    await expect(canvas.getByRole("tab", { name: "All 1" })).toBeVisible();

    await userEvent.type(canvas.getByRole("searchbox", { name: "Search invoices" }), "x");
    await expect(
      await canvas.findByRole("heading", { name: "No matching invoices" }),
    ).toBeVisible();
    await expect(canvas.queryByRole("table")).toBeNull();

    await userEvent.click(canvas.getByRole("button", { name: "Clear filters" }));
    await waitFor(() => expect(customers(canvasElement)).toHaveLength(5));
  },
});

const reminded = fn();
const paid = fn();

/** Selecting rows swaps the toolbar for bulk actions; Mark paid updates their status in place. */
export const BulkActions = meta.story({
  render: () => <InvoicesTable invoices={INVOICES} onRemind={reminded} onMarkPaid={paid} />,
  play: async ({ canvas }) => {
    reminded.mockClear();
    paid.mockClear();

    await userEvent.click(canvas.getByRole("tab", { name: "Overdue 2" }));
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select all rows on this page" }));

    const bulk = await canvas.findByRole("toolbar", { name: "Bulk actions" });
    await expect(bulk).toHaveTextContent("2 selected");
    await expect(canvas.queryByRole("searchbox")).toBeNull();

    await userEvent.click(within(bulk).getByRole("button", { name: "Send reminder" }));
    await expect(reminded).toHaveBeenCalledWith(["INV-1044", "INV-1048"]);
    await expect(canvas.getByRole("status")).toHaveTextContent("Reminder sent for 2 invoices.");

    await userEvent.click(canvas.getByRole("checkbox", { name: "Select all rows on this page" }));
    await userEvent.click(await canvas.findByRole("button", { name: "Mark paid" }));

    await expect(paid).toHaveBeenCalledWith(["INV-1044", "INV-1048"]);
    await expect(canvas.getByRole("tab", { name: "Overdue 0" })).toBeVisible();
    await expect(canvas.getByRole("tab", { name: "Paid 5" })).toBeVisible();
    await expect(await canvas.findByRole("searchbox", { name: "Search invoices" })).toBeVisible();
  },
});

/** With no invoices at all, the table is replaced by a prompt to create the first one. */
export const Empty = meta.story({
  render: () => <InvoicesTable invoices={[]} onCreate={created} />,
  play: async ({ canvas }) => {
    created.mockClear();

    await expect(canvas.getByRole("heading", { name: "No invoices yet" })).toBeVisible();
    await expect(canvas.queryByRole("table")).toBeNull();

    await userEvent.click(canvas.getByRole("button", { name: "Create your first invoice" }));
    await expect(created).toHaveBeenCalledTimes(1);
  },
});
