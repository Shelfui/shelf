import * as stylex from "@stylexjs/stylex";
import { expect, userEvent, waitFor, within } from "storybook/test";
import preview from "@/.storybook/preview";
import { Input } from "../input/input";
import {
  type DataTableColumnDef,
  DataTableColumnsMenu,
  useDataTable,
} from "../data-table/data-table";
import { DataTableVirtual } from "./data-table-virtual";

const meta = preview.meta({
  title: "Components/Data Table Virtual",
  // The columns menu renders in a portal on <body>.
  parameters: { figma: {}, a11y: { context: "body" } },
});

interface Event {
  id: string;
  name: string;
  amount: number;
}

const ROW_COUNT = 10_000;

// Generated once, outside the component, so the table sees the same array on every render.
const EVENTS: Event[] = Array.from({ length: ROW_COUNT }, (_, index) => ({
  id: `EVT-${String(index + 1).padStart(5, "0")}`,
  name: `Event ${index + 1}`,
  amount: ((index * 7919) % 5000) + 10,
}));

const COLUMNS: DataTableColumnDef<Event>[] = [
  { accessorKey: "id", header: "ID", enableSorting: false },
  { accessorKey: "name", header: "Name", sortFn: "alphanumeric" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => `$${row.original.amount.toFixed(2)}`,
    meta: { align: "end" },
  },
];

const filterText = (value: unknown) => (typeof value === "string" ? value : "");

function Events() {
  const table = useDataTable({
    columns: COLUMNS,
    data: EVENTS,
    getRowId: (row) => row.id,
    paginate: false,
  });
  const name = table.getColumn("name");

  return (
    <DataTableVirtual
      table={table}
      label="Events"
      selectable
      toolbar={
        <>
          <Input
            aria-label="Filter events"
            placeholder="Filter events…"
            value={filterText(name?.getFilterValue())}
            onValueChange={(value) => name?.setFilterValue(value)}
            style={styles.filter}
          />
          <DataTableColumnsMenu table={table} />
        </>
      }
    />
  );
}

/** The ids in the body, top to bottom, without the spacer rows. */
const ids = (element: HTMLElement) =>
  within(element)
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).queryAllByRole("cell")[1]?.textContent)
    .filter(Boolean);

/** Ten thousand rows, and only the ones in view are in the page. */
export const Default = meta.story({
  render: () => <Events />,
  play: async ({ canvas, canvasElement }) => {
    const table = canvas.getByRole("table", { name: "Events" });

    await expect(table).toHaveAttribute("aria-rowcount", String(ROW_COUNT + 1));
    await expect(canvas.getByText("10,000 rows")).toBeVisible();
    await expect(ids(canvasElement)[0]).toBe("EVT-00001");
    await expect(ids(canvasElement).length).toBeLessThan(40);
  },
});

/** Scrolling brings later rows in, and takes the first ones out. */
export const Scrolling = meta.story({
  render: () => <Events />,
  play: async ({ canvas, canvasElement }) => {
    const scroller = canvas.getByRole("region", { name: "Events, scrollable" });

    scroller.scrollTop = 44 * 5000;

    await waitFor(() => expect(ids(canvasElement)).toContain("EVT-05001"));
    await expect(ids(canvasElement)).not.toContain("EVT-00001");
    await expect(ids(canvasElement).length).toBeLessThan(40);
    const row = canvas.getByRole("row", { name: /EVT-05001/ });
    await expect(row).toHaveAttribute("aria-rowindex", "5002");
  },
});

/** Sorting reorders all ten thousand rows, not just the ones in view. */
export const Sorting = meta.story({
  render: () => <Events />,
  play: async ({ canvas, canvasElement }) => {
    const header = canvas.getByRole("columnheader", { name: "Name" });
    const sort = within(header).getByRole("button", { name: "Name" });

    await userEvent.click(sort);
    await expect(header).toHaveAttribute("aria-sort", "ascending");
    await expect(ids(canvasElement)[0]).toBe("EVT-00001");

    await userEvent.click(sort);
    await expect(header).toHaveAttribute("aria-sort", "descending");
    await waitFor(() => expect(ids(canvasElement)[0]).toBe("EVT-10000"));
  },
});

/** The filter narrows the rows, and the scroll area shrinks to match. */
export const Filter = meta.story({
  render: () => <Events />,
  play: async ({ canvas, canvasElement }) => {
    await userEvent.type(canvas.getByRole("textbox", { name: "Filter events" }), "Event 9999");

    await waitFor(() => expect(canvas.getByText("1 row")).toBeVisible());
    await expect(ids(canvasElement)).toEqual(["EVT-09999"]);

    await userEvent.type(canvas.getByRole("textbox", { name: "Filter events" }), "9");
    await expect(canvas.getByText("No results.")).toBeVisible();
  },
});

/** Select-all selects every row that passes the filters, including rows out of view. */
export const Selection = meta.story({
  render: () => <Events />,
  play: async ({ canvas }) => {
    const all = canvas.getByRole("checkbox", { name: "Select all rows" });

    await userEvent.click(all);
    await expect(all).toBeChecked();
    await expect(canvas.getByText("10,000 of 10,000 selected")).toBeVisible();

    await userEvent.click(canvas.getAllByRole("checkbox", { name: "Select row" })[0]!);
    await expect(all).toBePartiallyChecked();
    await expect(canvas.getByText("9,999 of 10,000 selected")).toBeVisible();

    await userEvent.click(all);
    await userEvent.click(all);
    await expect(canvas.getByText("0 of 10,000 selected")).toBeVisible();
  },
});

export const Dark = meta.story({
  parameters: { themes: { themeOverride: "dark" } },
  render: () => <Events />,
});

const styles = stylex.create({
  filter: { maxWidth: "16rem" },
});
