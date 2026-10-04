import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { DataTable, type DataTableColumnDef, useDataTable } from "./data-table";

// Tells React to expect act() calls, as in a test environment.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

interface Person {
  id: string;
  name: string;
}

const PEOPLE: Person[] = Array.from({ length: 10 }, (_, index) => ({
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
  const table = useDataTable({ columns: COLUMNS, data: PEOPLE, getRowId: (row) => row.id });
  return <DataTable table={table} label="People" selectable />;
}

async function mount() {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => root.render(<People />));
  renders.clear();
  return {
    container,
    unmount: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

test("selecting a row renders that row and no other", async () => {
  const { container, unmount } = await mount();
  const checkbox = container.querySelectorAll<HTMLElement>(
    '[role="checkbox"][aria-label="Select row"]',
  )[3]!;

  await act(async () => checkbox.click());

  expect(checkbox.getAttribute("aria-checked")).toBe("true");
  expect([...renders.keys()]).toEqual(["3"]);
  unmount();
});

test("sorting moves the rows without rendering them again", async () => {
  const { container, unmount } = await mount();
  const sort = container.querySelector<HTMLElement>("th button")!;
  const names = () =>
    [...container.querySelectorAll("tbody td:last-child")].map((cell) => cell.textContent);

  await act(async () => sort.click());
  await act(async () => sort.click());

  expect(names()[0]).toBe("Person 9");
  expect(renders.size).toBe(0);
  unmount();
});
