import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { type DataTableColumnDef, useDataTable } from "../data-table/data-table";
import { DataTableVirtual } from "./data-table-virtual";

// Tells React to expect act() calls, as in a test environment.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

interface Person {
  id: string;
  name: string;
}

const PEOPLE: Person[] = Array.from({ length: 10_000 }, (_, index) => ({
  id: String(index),
  name: `Person ${index}`,
}));

/** How often each row's name cell rendered. */
const renders = new Map<string, number>();

const COLUMNS: DataTableColumnDef<Person>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      renders.set(row.id, (renders.get(row.id) ?? 0) + 1);
      return row.original.name;
    },
  },
];

function People() {
  const table = useDataTable({
    columns: COLUMNS,
    data: PEOPLE,
    getRowId: (row) => row.id,
    paginate: false,
  });
  return <DataTableVirtual table={table} label="People" selectable />;
}

async function mount() {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => root.render(<People />));
  return {
    container,
    unmount: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

test("ten thousand rows render only the rows in view", async () => {
  const { unmount } = await mount();

  expect(renders.size).toBeGreaterThan(0);
  expect(renders.size).toBeLessThan(50);
  unmount();
});

test("selecting a row renders that row and no other", async () => {
  const { container, unmount } = await mount();
  renders.clear();
  const checkbox = container.querySelectorAll<HTMLElement>(
    '[role="checkbox"][aria-label="Select row"]',
  )[2]!;

  await act(async () => checkbox.click());

  expect(checkbox.getAttribute("aria-checked")).toBe("true");
  expect([...renders.keys()]).toEqual(["2"]);
  unmount();
});
