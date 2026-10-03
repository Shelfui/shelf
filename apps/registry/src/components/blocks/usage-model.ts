import { cluster, hierarchy } from "d3-hierarchy";

/** The parts of `shelf usage --json` the explorer reads. */
export interface UsageGraph {
  version: 1;
  projects: UsageProject[];
}

export interface UsageProject {
  id: string;
  namespace: string;
  name: string;
  source: { repo: string | null; path: string; commit: string | null };
  items: Record<string, UsageInstall>;
  consumes: Array<{ item: string; provider: string; package?: string }>;
  missing: string[];
}

export interface UsageInstall {
  type: string;
  revision: string;
  registry: "this" | "other" | "unknown";
  updateAvailable: boolean;
  modified: boolean;
  /** Imported by the project's own source. */
  direct: boolean;
  /** Installed items that import this one. */
  via: string[];
  usedBy: Array<{ file: string; project?: string }>;
}

/** An entry of the registry's `index.json`. */
export interface RegistryEntry {
  name: string;
  type: string;
  description: string;
}

/** `history.json` items: each item's revisions, newest first. */
export type RevisionHistory = Record<
  string,
  Array<{ revision: string; commit: string; date: string }>
>;

export type InstallState = "current" | "behind" | "modified" | "unused" | "package" | "other";

/** In legend order. */
export const STATES: InstallState[] = [
  "current",
  "behind",
  "modified",
  "unused",
  "package",
  "other",
];

export const STATE_LABELS: Record<InstallState, string> = {
  current: "Up to date",
  behind: "Behind",
  modified: "Modified",
  unused: "Not imported",
  package: "Via a package",
  other: "Other registry",
};

/** One item in one project: installed there, or used through another project's package. */
export interface Install {
  project: string;
  namespace: string;
  /** Where to run fix commands, relative to the repository. */
  path: string;
  item: string;
  type: string;
  state: InstallState;
  /** Files in the project that import it. */
  files: number;
  /** The project whose package provides it, for `package` installs. */
  provider: string | null;
  /** How many newer revisions the registry has; null when the revision isn't in its history. */
  revisionsBehind: number | null;
  /** Days since a newer revision replaced the installed one; null as above. */
  daysBehind: number | null;
}

/** The item or project the charts highlight. */
export type Focus = { kind: "item" | "project"; id: string } | null;

export function matches(row: Install, focus: Focus): boolean {
  if (!focus) return true;
  return focus.kind === "item" ? row.item === focus.id : row.project === focus.id;
}

export function sameFocus(a: Focus, b: Focus): boolean {
  return a?.kind === b?.kind && a?.id === b?.id;
}

export interface Filters {
  namespaces: string[];
  states: InstallState[];
  query: string;
}

export const NO_FILTERS: Filters = { namespaces: [], states: [], query: "" };

const DAY = 24 * 60 * 60 * 1000;

function stateOf(install: UsageInstall): InstallState {
  if (install.modified) return "modified";
  if (install.updateAvailable) return "behind";
  if (install.registry === "other") return "other";
  if (!install.direct && install.via.length === 0) return "unused";
  return "current";
}

/**
 * How far `revision` is behind the item's newest revision, and for how long. `now` is a
 * parameter so a snapshot renders the same on the server and in the browser.
 */
export function drift(
  history: RevisionHistory,
  item: string,
  revision: string,
  now: number,
): { revisionsBehind: number | null; daysBehind: number | null } {
  const revisions = history[item] ?? [];
  const index = revisions.findIndex((entry) => entry.revision === revision);
  if (index === -1) return { revisionsBehind: null, daysBehind: null };
  const replacedBy = revisions[index - 1];
  const daysBehind = replacedBy ? Math.max(0, (now - Date.parse(replacedBy.date)) / DAY) : 0;
  return { revisionsBehind: index, daysBehind };
}

/** Every install, sorted by project then item, so the charts are stable. */
export function installs(
  usage: UsageGraph,
  items: RegistryEntry[],
  history: RevisionHistory,
  now: number,
): Install[] {
  const types = new Map(items.map((entry) => [entry.name, entry.type]));
  const rows: Install[] = [];
  for (const project of usage.projects) {
    const base = { project: project.id, namespace: project.namespace, path: project.source.path };
    for (const [item, install] of Object.entries(project.items)) {
      rows.push({
        ...base,
        item,
        type: install.type,
        state: stateOf(install),
        files: new Set(install.usedBy.map((ref) => ref.project ?? ref.file)).size,
        provider: null,
        ...(install.registry === "other"
          ? { revisionsBehind: null, daysBehind: null }
          : drift(history, item, install.revision, now)),
      });
    }
    for (const consumed of project.consumes) {
      if (project.items[consumed.item]) continue;
      rows.push({
        ...base,
        item: consumed.item,
        type: types.get(consumed.item) ?? "component",
        state: "package",
        files: 0,
        provider: consumed.provider,
        revisionsBehind: null,
        daysBehind: null,
      });
    }
  }
  return rows.toSorted(
    (a, b) => a.project.localeCompare(b.project) || a.item.localeCompare(b.item),
  );
}

export function applyFilters(rows: Install[], filters: Filters): Install[] {
  const query = filters.query.trim().toLowerCase();
  return rows.filter(
    (row) =>
      (filters.namespaces.length === 0 || filters.namespaces.includes(row.namespace)) &&
      (filters.states.length === 0 || filters.states.includes(row.state)) &&
      (!query || row.item.includes(query) || row.project.toLowerCase().includes(query)),
  );
}

export interface Summary {
  projects: number;
  namespaces: number;
  /** Registry items used by at least one project, out of all of them. */
  adopted: number;
  available: number;
  behind: number;
  modified: number;
  unused: number;
}

export function summary(rows: Install[], items: RegistryEntry[]): Summary {
  const installed = rows.filter((row) => row.state !== "package");
  return {
    projects: new Set(rows.map((row) => row.project)).size,
    namespaces: new Set(rows.map((row) => row.namespace)).size,
    adopted: new Set(rows.filter((row) => row.state !== "unused").map((row) => row.item)).size,
    available: items.length,
    behind: installed.filter((row) => (row.revisionsBehind ?? 0) > 0).length,
    modified: installed.filter((row) => row.state === "modified").length,
    unused: installed.filter((row) => row.state === "unused").length,
  };
}

export interface ItemBar {
  item: string;
  total: number;
  counts: Record<InstallState, number>;
}

/** Installs per item and state, most used first. */
export function itemBars(rows: Install[]): ItemBar[] {
  const bars = new Map<string, ItemBar>();
  for (const row of rows) {
    const bar = bars.get(row.item) ?? {
      item: row.item,
      total: 0,
      counts: { current: 0, behind: 0, modified: 0, unused: 0, package: 0, other: 0 },
    };
    bar.total++;
    bar.counts[row.state]++;
    bars.set(row.item, bar);
  }
  return [...bars.values()].toSorted((a, b) => b.total - a.total || a.item.localeCompare(b.item));
}

export interface RadialNode {
  id: string;
  kind: "project" | "item";
  label: string;
  /** The namespace of a project, or the type of an item. */
  group: string;
  /** Radians, clockwise from 12 o'clock. */
  angle: number;
}

export interface RadialLink {
  source: string;
  target: string;
  state: InstallState;
  /** `[angle, radius]` points from the project, through its namespace and the item type, to the item. */
  points: Array<[number, number]>;
}

export const nodeId = (kind: RadialNode["kind"], name: string) => `${kind}:${name}`;

/**
 * Projects grouped by namespace on the left half of a circle, items grouped by type on the
 * right, and one link per install routed through both groups, ready for `curveBundle`.
 */
export function radialLayout(rows: Install[], radius: number) {
  const PAD = 0.12;
  const side = (
    kind: RadialNode["kind"],
    leaves: Array<{ name: string; group: string }>,
    start: number,
  ) => {
    const groups = new Map<string, string[]>();
    for (const leaf of leaves.toSorted(
      (a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name),
    )) {
      groups.set(leaf.group, [...(groups.get(leaf.group) ?? []), leaf.name]);
    }
    const root = hierarchy<{
      name: string;
      children?: Array<{ name: string; children?: unknown }>;
    }>({
      name: kind,
      children: [...groups].map(([group, names]) => ({
        name: group,
        children: names.map((name) => ({ name })),
      })),
    });
    cluster<(typeof root)["data"]>().size([Math.PI - 2 * PAD, radius])(root);
    const nodes = new Map<string, RadialNode>();
    const groupAngles = new Map<string, number>();
    for (const node of root.descendants()) {
      const angle = start + PAD + (node.x ?? 0);
      if (node.depth === 1) groupAngles.set(node.data.name, angle);
      if (node.depth === 2) {
        nodes.set(node.data.name, {
          id: nodeId(kind, node.data.name),
          kind,
          label: node.data.name,
          group: node.parent!.data.name,
          angle,
        });
      }
    }
    return { nodes, groupAngles };
  };

  const projects = new Map(rows.map((row) => [row.project, row.namespace]));
  const items = new Map(rows.map((row) => [row.item, row.type]));
  const left = side(
    "project",
    [...projects].map(([name, group]) => ({ name, group })),
    Math.PI,
  );
  const right = side(
    "item",
    [...items].map(([name, group]) => ({ name, group })),
    0,
  );
  const links: RadialLink[] = rows.map((row) => {
    const project = left.nodes.get(row.project)!;
    const item = right.nodes.get(row.item)!;
    return {
      source: project.id,
      target: item.id,
      state: row.state,
      points: [
        [project.angle, radius],
        [left.groupAngles.get(project.group)!, radius * 0.55],
        [0, 0],
        [right.groupAngles.get(item.group)!, radius * 0.55],
        [item.angle, radius],
      ],
    };
  });
  return { nodes: [...left.nodes.values(), ...right.nodes.values()], links };
}

export interface FlowNode {
  id: string;
  label: string;
  kind: "registry" | "project";
}

export interface FlowLink {
  source: string;
  target: string;
  /** Number of items. */
  value: number;
  items: string[];
}

export const REGISTRY_NODE = "registry";

/**
 * The registry feeds every project that installs items; a project whose package other
 * projects import feeds them in turn.
 */
export function flowGraph(rows: Install[]): { nodes: FlowNode[]; links: FlowLink[] } {
  const links = new Map<string, FlowLink>();
  const add = (source: string, target: string, item: string) => {
    if (source === target) return;
    const key = `${source}\n${target}`;
    const link = links.get(key) ?? { source, target, value: 0, items: [] };
    link.value++;
    link.items.push(item);
    links.set(key, link);
  };
  for (const row of rows) {
    if (row.state === "package" && row.provider) add(row.provider, row.project, row.item);
    else if (row.state !== "package") add(REGISTRY_NODE, row.project, row.item);
  }
  const ids = new Set([...links.values()].flatMap((link) => [link.source, link.target]));
  const nodes: FlowNode[] = [...ids].toSorted().map((id) => ({
    id,
    label: id === REGISTRY_NODE ? "Registry" : id,
    kind: id === REGISTRY_NODE ? "registry" : "project",
  }));
  return { nodes, links: [...links.values()] };
}

export const DEFAULT_RUNNER = "bunx shelf";

/** The command that resolves an install, run in its project. */
export function fixCommand(row: Install, runner = DEFAULT_RUNNER): string | null {
  if (row.state === "modified") return `${runner} diff ${row.item} --local`;
  if ((row.revisionsBehind ?? 0) > 0) return `${runner} update ${row.item}`;
  return null;
}

export function formatAge(days: number): string {
  if (days < 1) return `${Math.max(1, Math.round(days * 24))}h`;
  if (days < 60) return `${Math.round(days)}d`;
  return `${Math.round(days / 30)}mo`;
}
