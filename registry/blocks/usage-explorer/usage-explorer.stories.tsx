import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import preview from "@/.storybook/preview";
import {
  NO_FILTERS,
  type RegistryEntry,
  type RevisionHistory,
  type UsageGraph,
  type UsageInstall,
} from "./usage-model";
import { UsageExplorer } from "./usage-explorer";

const NOW = Date.parse("2026-09-28T12:00:00Z");

const DAY = 24 * 60 * 60 * 1000;
const date = (daysAgo: number) => new Date(NOW - daysAgo * DAY).toISOString();

const items: RegistryEntry[] = [
  { name: "foundations", type: "foundation", description: "Tokens and themes." },
  { name: "utils", type: "util", description: "Shared helpers." },
  { name: "button", type: "component", description: "A button." },
  { name: "card", type: "component", description: "A surface." },
  { name: "dialog", type: "component", description: "A modal dialog." },
  { name: "input", type: "component", description: "A text input." },
  { name: "select", type: "component", description: "A select." },
  { name: "table", type: "component", description: "A table." },
  { name: "tabs", type: "component", description: "Tabs." },
  { name: "toast", type: "component", description: "A toast." },
  { name: "login-form", type: "block", description: "A login form." },
];

/** Revisions per item, newest first, replaced at the given ages in days. */
const ages: Record<string, number[]> = {
  foundations: [2, 20, 75],
  utils: [120],
  button: [4, 33, 90],
  card: [60],
  dialog: [12, 45],
  input: [9, 80],
  select: [30],
  table: [6, 26, 70, 140],
  tabs: [100],
  toast: [15],
  "login-form": [50],
};

const history: RevisionHistory = Object.fromEntries(
  Object.entries(ages).map(([item, days]) => [
    item,
    days.map((daysAgo, index) => ({
      revision: `${item}-${days.length - index}`,
      commit: `c${daysAgo}`,
      date: date(daysAgo),
    })),
  ]),
);

/** `[item, revisions behind, flags]`; flags: m modified, u not imported, o other registry. */
type Row = [string, number, string?];

function project(
  id: string,
  path: string,
  rows: Row[],
  consumes: UsageGraph["projects"][number]["consumes"] = [],
): UsageGraph["projects"][number] {
  const [namespace = "", name = ""] = id.split("/");
  const entries = rows.map(([item, behind, flags = ""]): [string, UsageInstall] => {
    const revisions = history[item] ?? [];
    const revision = revisions[Math.min(behind, revisions.length - 1)]?.revision ?? `${item}-1`;
    return [
      item,
      {
        type: items.find((entry) => entry.name === item)?.type ?? "component",
        revision,
        registry: flags.includes("o") ? "other" : "this",
        updateAvailable: behind > 0,
        modified: flags.includes("m"),
        direct: !flags.includes("u"),
        via: [],
        usedBy: flags.includes("u") ? [] : [{ file: "src/app.tsx" }],
      },
    ];
  });
  return {
    id,
    namespace,
    name,
    source: { repo: "acme/monorepo", path, commit: "abc1234" },
    items: Object.fromEntries(entries),
    consumes,
    missing: [],
  };
}

const usage: UsageGraph = {
  version: 1,
  projects: [
    project("platform/ui", "packages/ui", [
      ["foundations", 0],
      ["utils", 0],
      ["button", 0],
      ["card", 0],
      ["dialog", 0],
      ["input", 0],
      ["select", 0],
      ["table", 1, "m"],
    ]),
    project("platform/admin-tools", "apps/admin", [
      ["foundations", 1],
      ["button", 1],
      ["table", 2],
      ["tabs", 0],
      ["toast", 0, "u"],
    ]),
    project(
      "payments/bill-pay",
      "apps/bill-pay",
      [
        ["foundations", 0],
        ["button", 0, "m"],
        ["dialog", 1],
        ["table", 0],
      ],
      [
        { item: "card", provider: "platform/ui", package: "@acme/ui" },
        { item: "input", provider: "platform/ui", package: "@acme/ui" },
      ],
    ),
    project(
      "payments/invoicing",
      "apps/invoicing",
      [
        ["foundations", 2],
        ["button", 2],
        ["table", 3, "m"],
        ["select", 0],
      ],
      [{ item: "dialog", provider: "platform/ui", package: "@acme/ui" }],
    ),
    project("growth/marketing-site", "apps/marketing", [
      ["foundations", 1],
      ["button", 1],
      ["card", 0, "m"],
      ["tabs", 0],
      ["login-form", 0],
    ]),
    project("growth/onboarding", "apps/onboarding", [
      ["foundations", 0],
      ["button", 0],
      ["input", 1],
      ["login-form", 0, "m"],
      ["toast", 0],
    ]),
    project("support/help-center", "apps/help", [
      ["foundations", 2],
      ["button", 2],
      ["card", 0],
      ["input", 1, "u"],
      ["tabs", 0, "o"],
    ]),
  ],
};

const meta = preview.meta({
  title: "Blocks/Usage Explorer",
  component: UsageExplorer,
  parameters: { figma: { fill: true }, layout: "padded" },
});

/** Seven projects across four namespaces. Clicking an item pins it and lists every copy with its fix. */
export const Drift = meta.story({
  render: () => <UsageExplorer usage={usage} items={items} history={history} now={NOW} />,
  play: async ({ canvas }) => {
    const projects = canvas.getByText("Projects").closest("div");
    await expect(projects).toHaveTextContent("Projects7in 4 namespaces");
    await expect(canvas.getByRole("tab", { name: "Drift", selected: true })).toBeVisible();

    const bars = canvas.getByRole("list", { name: "Installs per item" });
    const button = within(bars).getByRole("button", { name: /^button: in 7 projects/ });
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "true");

    const selection = canvas.getByRole("region", { name: "Selected item: button" });
    await expect(within(selection).getAllByRole("row")).toHaveLength(8);
    await expect(
      within(selection).getAllByText("bunx @shelfui/cli update button").length,
    ).toBeGreaterThan(0);

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("region", { name: /^Selected/ })).toBeNull());
  },
});

/** Projects on the left, items on the right; hovering either lights up its installs. */
export const Graph = meta.story({
  render: () => <UsageExplorer usage={usage} items={items} history={history} now={NOW} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Graph" }));
    const graph = await canvas.findByRole("group", { name: /7 projects and 11 items/ });
    const node = within(graph).getByRole("button", { name: /^payments\/bill-pay, payments/ });
    await userEvent.click(node);
    await expect(node).toHaveAttribute("aria-pressed", "true");
    await expect(
      canvas.getByRole("region", { name: "Selected project: payments/bill-pay" }),
    ).toBeVisible();
  },
});

/** Items flow from the registry into projects, and through `@acme/ui` into the apps that import it. */
export const Flow = meta.story({
  render: () => <UsageExplorer usage={usage} items={items} history={history} now={NOW} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Flow" }));
    const flow = await canvas.findByRole("group", { name: /into 7 projects/ });
    await expect(within(flow).getByRole("button", { name: /^platform\/ui: / })).toBeVisible();
  },
});

/** Filters can live in the URL: pass them in and write them back on change. */
export const ControlledFilters = meta.story({
  render: function Render() {
    const [filters, setFilters] = useState({ ...NO_FILTERS, namespaces: ["payments"] });
    return (
      <UsageExplorer
        usage={usage}
        items={items}
        history={history}
        now={NOW}
        filters={filters}
        onFiltersChange={setFilters}
      />
    );
  },
  play: async ({ canvas }) => {
    const summary = canvas.getByText("Projects").closest("div");
    await expect(summary).toHaveTextContent("Projects2");

    await userEvent.type(
      canvas.getByRole("searchbox", { name: "Filter items and projects" }),
      "nothing",
    );
    await expect(canvas.getByText("No installs match these filters.")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Clear filters" }));
    await expect(summary).toHaveTextContent("Projects7");
  },
});
