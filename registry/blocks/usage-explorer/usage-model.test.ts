import { describe, expect, test } from "bun:test";
import {
  type RevisionHistory,
  type UsageGraph,
  type UsageInstall,
  NO_FILTERS,
  applyFilters,
  drift,
  fixCommand,
  flowGraph,
  formatAge,
  installs,
  itemBars,
  radialLayout,
  summary,
} from "./usage-model";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.parse("2026-09-28T12:00:00Z");

const history: RevisionHistory = {
  button: [
    { revision: "b3", commit: "c3", date: "2026-09-27T12:00:00Z" },
    { revision: "b2", commit: "c2", date: "2026-09-18T12:00:00Z" },
    { revision: "b1", commit: "c1", date: "2026-09-01T12:00:00Z" },
  ],
  badge: [{ revision: "g1", commit: "c1", date: "2026-09-01T12:00:00Z" }],
  card: [{ revision: "k1", commit: "c1", date: "2026-09-01T12:00:00Z" }],
};

function install(revision: string, overrides: Partial<UsageInstall> = {}): UsageInstall {
  return {
    type: "component",
    revision,
    registry: "this",
    updateAvailable: false,
    modified: false,
    direct: true,
    via: [],
    usedBy: [{ file: "src/a.tsx" }, { file: "src/b.tsx" }],
    ...overrides,
  };
}

const usage: UsageGraph = {
  version: 1,
  projects: [
    {
      id: "platform/ui",
      namespace: "platform",
      name: "ui",
      source: { repo: null, path: "packages/ui", commit: null },
      items: { button: install("b3"), card: install("k1") },
      consumes: [],
      missing: [],
    },
    {
      id: "payments/bill-pay",
      namespace: "payments",
      name: "bill-pay",
      source: { repo: null, path: "apps/bill-pay", commit: null },
      items: {
        badge: install("g1", { modified: true }),
        button: install("b1", { updateAvailable: true }),
      },
      consumes: [
        { item: "card", provider: "platform/ui", package: "@acme/ui" },
        { item: "button", provider: "platform/ui", package: "@acme/ui" },
      ],
      missing: [],
    },
    {
      id: "growth/onboarding",
      namespace: "growth",
      name: "onboarding",
      source: { repo: null, path: "apps/onboarding", commit: null },
      items: {
        card: install("k1", { direct: false, usedBy: [] }),
        badge: install("zz", { registry: "other" }),
      },
      consumes: [],
      missing: [],
    },
  ],
};

const items = ["badge", "button", "card", "dialog"].map((name) => ({
  name,
  type: "component",
  description: "",
}));

const rows = installs(usage, items, history, NOW);
const row = (project: string, item: string) =>
  rows.find((entry) => entry.project === project && entry.item === item)!;

describe("usage explorer model", () => {
  test("drift counts newer revisions and days since the next one appeared", () => {
    expect(drift(history, "button", "b3", NOW)).toEqual({ revisionsBehind: 0, daysBehind: 0 });
    expect(drift(history, "button", "b1", NOW)).toEqual({
      revisionsBehind: 2,
      daysBehind: (NOW - Date.parse("2026-09-18T12:00:00Z")) / DAY,
    });
    expect(drift(history, "button", "unknown", NOW)).toEqual({
      revisionsBehind: null,
      daysBehind: null,
    });
  });

  test("each install gets one state, most actionable first", () => {
    expect(row("platform/ui", "button").state).toBe("current");
    expect(row("payments/bill-pay", "badge").state).toBe("modified");
    expect(row("payments/bill-pay", "button")).toMatchObject({
      state: "behind",
      revisionsBehind: 2,
    });
    expect(row("growth/onboarding", "card").state).toBe("unused");
    expect(row("growth/onboarding", "badge")).toMatchObject({
      state: "other",
      revisionsBehind: null,
    });
    expect(row("platform/ui", "button").files).toBe(2);
  });

  test("items used through a package are installs of the consumer, unless it has its own copy", () => {
    expect(row("payments/bill-pay", "card")).toMatchObject({
      state: "package",
      provider: "platform/ui",
    });
    expect(
      rows.filter((entry) => entry.project === "payments/bill-pay" && entry.item === "button"),
    ).toHaveLength(1);
  });

  test("filters combine namespace, state, and a search over items and projects", () => {
    expect(applyFilters(rows, NO_FILTERS)).toEqual(rows);
    const payments = applyFilters(rows, { ...NO_FILTERS, namespaces: ["payments"] });
    expect(new Set(payments.map((entry) => entry.project))).toEqual(new Set(["payments/bill-pay"]));
    expect(applyFilters(rows, { ...NO_FILTERS, states: ["behind"] }).map((e) => e.item)).toEqual([
      "button",
    ]);
    expect(applyFilters(rows, { ...NO_FILTERS, query: "ONBOARD" })).toHaveLength(2);
  });

  test("the summary counts projects, adoption, and what needs attention", () => {
    expect(summary(rows, items)).toEqual({
      projects: 3,
      namespaces: 3,
      adopted: 3,
      available: 4,
      behind: 1,
      modified: 1,
      unused: 1,
    });
  });

  test("item bars count states per item, most used first", () => {
    const bars = itemBars(rows);
    expect(bars.map((bar) => bar.item)).toEqual(["card", "badge", "button"]);
    expect(bars.find((bar) => bar.item === "card")!.counts).toMatchObject({
      current: 1,
      package: 1,
      unused: 1,
    });
  });

  test("the radial layout puts projects on the left, items on the right, one link per install", () => {
    const { nodes, links } = radialLayout(rows, 100);
    const projects = nodes.filter((node) => node.kind === "project");
    const itemNodes = nodes.filter((node) => node.kind === "item");
    expect(projects).toHaveLength(3);
    expect(itemNodes).toHaveLength(3);
    for (const node of projects) expect(node.angle).toBeGreaterThan(Math.PI);
    for (const node of itemNodes) expect(node.angle).toBeLessThan(Math.PI);
    expect(links).toHaveLength(rows.length);
    expect(links[0]!.points[0]![1]).toBe(100);
    expect(links[0]!.points[2]).toEqual([0, 0]);
  });

  test("the flow runs from the registry to installing projects, then through packages", () => {
    const { nodes, links } = flowGraph(rows);
    expect(nodes.map((node) => node.id)).toEqual([
      "growth/onboarding",
      "payments/bill-pay",
      "platform/ui",
      "registry",
    ]);
    expect(links).toContainEqual({
      source: "platform/ui",
      target: "payments/bill-pay",
      value: 1,
      items: ["card"],
    });
    expect(links.find((link) => link.target === "platform/ui")!.value).toBe(2);
  });

  test("fix commands and ages read the way the CLI prints them", () => {
    expect(fixCommand(row("payments/bill-pay", "button"))).toBe("bunx @shelfui/cli update button");
    expect(fixCommand(row("payments/bill-pay", "badge"))).toBe(
      "bunx @shelfui/cli diff badge --local",
    );
    expect(fixCommand(row("platform/ui", "button"))).toBeNull();
    expect(fixCommand(row("payments/bill-pay", "button"), "pnpm dlx @shelfui/cli")).toBe(
      "pnpm dlx @shelfui/cli update button",
    );
    expect([formatAge(0.1), formatAge(3.4), formatAge(90)]).toEqual(["2h", "3d", "3mo"]);
  });
});
