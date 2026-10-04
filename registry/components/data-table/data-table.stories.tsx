import * as stylex from "@stylexjs/stylex";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import preview from "@/.storybook/preview";
import { Input } from "../input/input";
import {
  DataTable,
  type DataTableColumnDef,
  DataTableColumnsMenu,
  useDataTable,
} from "./data-table";

const meta = preview.meta({
  title: "Components/Data Table",
  // The columns menu renders in a portal on <body>.
  parameters: { figma: {}, a11y: { context: "body" } },
});

interface Invoice {
  id: string;
  customer: string;
  amount: number;
}

const INVOICES: Invoice[] = [
  { id: "INV-001", customer: "Initech", amount: 2450 },
  { id: "INV-002", customer: "Acme Inc.", amount: 1200 },
  { id: "INV-003", customer: "Globex", amount: 860 },
  { id: "INV-004", customer: "Umbrella", amount: 3100 },
  { id: "INV-005", customer: "Hooli", amount: 640 },
];

// Defined outside the component, so TanStack Table sees the same columns on every render.
const COLUMNS: DataTableColumnDef<Invoice>[] = [
  { accessorKey: "id", header: "Invoice", enableSorting: false },
  { accessorKey: "customer", header: "Customer" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => `$${row.original.amount.toFixed(2)}`,
    meta: { align: "end" },
  },
];

const filterText = (value: unknown) => (typeof value === "string" ? value : "");

function Invoices({ pageSize }: { pageSize?: number }) {
  const table = useDataTable({
    columns: COLUMNS,
    data: INVOICES,
    getRowId: (row) => row.id,
    pageSize,
  });
  const customer = table.getColumn("customer");

  return (
    <DataTable
      table={table}
      label="Invoices"
      selectable
      toolbar={
        <>
          <Input
            aria-label="Filter customers"
            placeholder="Filter customers…"
            value={filterText(customer?.getFilterValue())}
            onValueChange={(value) => customer?.setFilterValue(value)}
            style={styles.filter}
          />
          <DataTableColumnsMenu table={table} />
        </>
      }
    />
  );
}

/** The customer names in the body, top to bottom. */
const customers = (table: HTMLElement) =>
  within(table)
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[2]!.textContent);

/** Sort buttons cycle ascending, descending, and unsorted, and `aria-sort` follows. */
export const Sorting = meta.story({
  render: () => <Invoices />,
  play: async ({ canvas }) => {
    const table = canvas.getByRole("table", { name: "Invoices" });
    const header = canvas.getByRole("columnheader", { name: "Customer" });
    const sort = within(header).getByRole("button", { name: "Customer" });

    await expect(header).toHaveAttribute("aria-sort", "none");
    await expect(canvas.getByRole("columnheader", { name: "Invoice" })).not.toHaveAttribute(
      "aria-sort",
    );

    await userEvent.click(sort);
    await expect(header).toHaveAttribute("aria-sort", "ascending");
    await expect(customers(table)).toEqual(["Acme Inc.", "Globex", "Hooli", "Initech", "Umbrella"]);

    await userEvent.click(sort);
    await expect(header).toHaveAttribute("aria-sort", "descending");
    await expect(customers(table)).toEqual(["Umbrella", "Initech", "Hooli", "Globex", "Acme Inc."]);

    await userEvent.click(sort);
    await expect(header).toHaveAttribute("aria-sort", "none");
    await expect(customers(table)).toEqual(["Initech", "Acme Inc.", "Globex", "Umbrella", "Hooli"]);
  },
});

/** Select-all checks every row on the page, and turns mixed when only some are checked. */
export const Selection = meta.story({
  render: () => <Invoices />,
  play: async ({ canvas }) => {
    const all = canvas.getByRole("checkbox", { name: "Select all rows on this page" });

    await userEvent.click(all);

    await expect(all).toBeChecked();
    for (const row of canvas.getAllByRole("checkbox", { name: "Select row" })) {
      await expect(row).toBeChecked();
    }
    await expect(canvas.getByText("5 of 5 selected")).toBeVisible();

    await userEvent.click(canvas.getAllByRole("checkbox", { name: "Select row" })[0]!);

    await expect(all).toBePartiallyChecked();
    await expect(canvas.getByText("4 of 5 selected")).toBeVisible();

    await userEvent.click(all);
    await expect(all).toBeChecked();

    await userEvent.click(all);
    await expect(all).not.toBeChecked();
    await expect(canvas.getByText("0 of 5 selected")).toBeVisible();
  },
});

/** Previous and Next move between pages, and are disabled at either end. */
export const Pagination = meta.story({
  render: () => <Invoices pageSize={2} />,
  play: async ({ canvas }) => {
    const table = canvas.getByRole("table");
    const previous = canvas.getByRole("button", { name: "Go to previous page" });
    const next = canvas.getByRole("button", { name: "Go to next page" });

    await expect(canvas.getByText("Page 1 of 3")).toBeVisible();
    await expect(previous).toBeDisabled();
    await expect(customers(table)).toEqual(["Initech", "Acme Inc."]);

    await userEvent.click(next);
    await expect(canvas.getByText("Page 2 of 3")).toBeVisible();
    await expect(customers(table)).toEqual(["Globex", "Umbrella"]);

    await userEvent.click(next);
    await expect(customers(table)).toEqual(["Hooli"]);
    await expect(next).toBeDisabled();

    await userEvent.click(previous);
    await expect(canvas.getByText("Page 2 of 3")).toBeVisible();
  },
});

/** The toolbar's filter narrows the rows; an empty result says so. */
export const Filter = meta.story({
  render: () => <Invoices />,
  play: async ({ canvas }) => {
    const table = canvas.getByRole("table");
    const filter = canvas.getByRole("textbox", { name: "Filter customers" });

    await userEvent.type(filter, "glo");
    await expect(customers(table)).toEqual(["Globex"]);
    await expect(canvas.getByText("0 of 1 selected")).toBeVisible();

    await userEvent.type(filter, "zzz");
    await expect(canvas.getByText("No results.")).toBeVisible();
    await expect(
      canvas.getByRole("checkbox", { name: "Select all rows on this page" }),
    ).toHaveAttribute("aria-disabled", "true");
  },
});

/** The columns menu hides and restores a column, in its original position. */
export const ColumnVisibility = meta.story({
  render: () => <Invoices />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Columns" }));
    const invoice = await screen.findByRole("menuitemcheckbox", { name: "Invoice" });
    await expect(invoice).toBeChecked();

    await userEvent.click(invoice);
    await waitFor(() => expect(canvas.queryByRole("columnheader", { name: "Invoice" })).toBeNull());

    await userEvent.click(invoice);
    await waitFor(() =>
      expect(canvas.getAllByRole("columnheader")[1]).toHaveAccessibleName("Invoice"),
    );
  },
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <Invoices />,
  play: async ({ canvas }) => {
    const header = canvas.getByRole("columnheader", { name: "Customer" });

    await expect(getComputedStyle(header).color).toBe("rgb(161, 161, 161)");
  },
});

const styles = stylex.create({
  filter: { maxWidth: "16rem" },
});
