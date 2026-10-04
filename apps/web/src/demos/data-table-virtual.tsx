"use client";

import * as stylex from "@stylexjs/stylex";
import { DataTableVirtual } from "@/components/ui/data-table-virtual";
import {
  type DataTableColumnDef,
  DataTableColumnsMenu,
  useDataTable,
} from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";

interface Event {
  id: string;
  name: string;
  amount: number;
}

// Generated once, outside the component, so the table sees the same array on every render.
const EVENTS: Event[] = Array.from({ length: 10_000 }, (_, index) => ({
  id: `EVT-${String(index + 1).padStart(5, "0")}`,
  name: `Event ${index + 1}`,
  amount: ((index * 7919) % 5000) + 10,
}));

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const COLUMNS: DataTableColumnDef<Event>[] = [
  { accessorKey: "id", header: "ID", enableSorting: false },
  { accessorKey: "name", header: "Name", sortFn: "alphanumeric" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => currency.format(row.original.amount),
    meta: { align: "end" },
  },
];

const filterText = (value: unknown) => (typeof value === "string" ? value : "");

export default function DataTableVirtualDemo() {
  const table = useDataTable({
    columns: COLUMNS,
    data: EVENTS,
    getRowId: (row) => row.id,
    paginate: false,
  });

  return (
    <DataTableVirtual
      table={table}
      label="Events"
      selectable
      style={styles.scroller}
      toolbar={
        <>
          <Input
            aria-label="Filter events"
            placeholder="Filter events…"
            value={filterText(table.getColumn("name")?.getFilterValue())}
            onValueChange={(value) => table.getColumn("name")?.setFilterValue(value)}
            style={styles.filter}
          />
          <DataTableColumnsMenu table={table} />
        </>
      }
    />
  );
}

const styles = stylex.create({
  filter: { maxWidth: "16rem" },
  scroller: { height: "24rem" },
});
