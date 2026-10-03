import { createContext, useContext, useEffect, useState } from "react";
import type { InstalledItem, UsageGraph } from "../../../packages/cli/src/core/usage/types";
import type { VerifyReport } from "../../../scripts/verify/types";

/** One entry of the published `index.json`, as `shelf build` writes it. */
export interface IndexItem {
  name: string;
  type: string;
  description: string;
  path: string;
  revision?: string;
  files?: string[];
  dependencies?: Record<string, string>;
  shelfDependencies?: string[];
  /** The item's counterpart in Figma. */
  figma?: string;
}

interface HistoryEntry {
  revision: string;
  commit: string;
  date: string;
}

export interface Story {
  id: string;
  title: string;
  name: string;
  importPath: string;
}

export type { Verification, VerifyReport, Weight } from "../../../scripts/verify/types";

export type {
  InstalledItem,
  ProjectUsage,
  UsageGraph,
  UsageRef,
} from "../../../packages/cli/src/core/usage/types";

export interface Registry {
  /** The URL this registry installs from, e.g. `https://ui.example.com/registry/`. */
  url: string;
  items: IndexItem[];
  /** The Figma library file and each item's node in it, from index.json. */
  figma?: { file: string; nodes: Record<string, string> };
  usage: UsageGraph | null;
  /** What each item weighs and has been checked for, from `bun run verify`. Absent in older builds. */
  verify: VerifyReport | null;
  stories: Story[];
  history: Record<string, HistoryEntry[]>;
}

/** Registry files are written by `shelf build`, so their shape is trusted. */
export async function fetchJson<T>(path: string): Promise<T | null> {
  const response = await fetch(new URL(path, registryUrl()));
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${path}: ${response.status} ${response.statusText}`);
  const data: unknown = await response.json();
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return data as T;
}

export function registryUrl(): string {
  return new URL(".", window.location.href.split("#")[0]).toString();
}

export function fetchText(path: string): Promise<string> {
  return fetch(new URL(path, registryUrl())).then((response) => {
    if (!response.ok) throw new Error(`${path}: ${response.status} ${response.statusText}`);
    return response.text();
  });
}

export async function loadRegistry(): Promise<Registry> {
  const [index, usage, verify, storybook, history] = await Promise.all([
    fetchJson<{ items: IndexItem[]; figma?: Registry["figma"] }>("index.json"),
    fetchJson<UsageGraph>("usage.json").catch(() => null),
    fetchJson<VerifyReport>("verify.json").catch(() => null),
    fetchJson<{ entries?: Record<string, Story & { type: string }> }>("storybook/index.json").catch(
      () => null,
    ),
    fetchJson<{ items: Record<string, HistoryEntry[]> }>("history.json").catch(() => null),
  ]);
  if (!index) throw new Error("No index.json next to this page. Is this a Shelf registry build?");
  return {
    url: registryUrl(),
    items: index.items,
    ...(index.figma && { figma: index.figma }),
    usage,
    verify,
    stories: Object.values(storybook?.entries ?? {}).filter((entry) => entry.type === "story"),
    history: history?.items ?? {},
  };
}

/** Stories whose file lives in the item's directory, e.g. `components/button/`. */
export function storiesFor(registry: Registry, item: IndexItem): Story[] {
  const directory = `/${item.path}/`;
  return registry.stories.filter((story) =>
    `/${story.importPath.replace(/^\.\//, "")}`.includes(directory),
  );
}

export type ItemState = "current" | "update" | "modified" | "unused" | "other" | "consumed";

/** The one state a matrix cell shows, most actionable first. */
export function itemState(item: InstalledItem): ItemState {
  if (item.modified) return "modified";
  if (item.updateAvailable) return "update";
  if (item.registry === "other") return "other";
  if (!item.direct && item.via.length === 0) return "unused";
  return "current";
}

/** Projects that installed `name`, and projects that use it through another project. */
export function projectsUsing(usage: UsageGraph, name: string) {
  const installed = usage.projects.filter((project) => project.items[name]);
  const consuming = usage.projects.filter((project) =>
    project.consumes.some((consumed) => consumed.item === name),
  );
  return { installed, consuming };
}

export const RegistryContext = createContext<Registry | null>(null);

export function useRegistry(): Registry {
  const registry = useContext(RegistryContext);
  if (!registry) throw new Error("useRegistry needs <RegistryContext.Provider>");
  return registry;
}

export function useAsync<T>(load: () => Promise<T>, key: string) {
  const [state, setState] = useState<{ key: string; value?: T; error?: Error }>({ key });
  useEffect(() => {
    let active = true;
    load().then(
      (value) => active && setState({ key, value }),
      (error: unknown) =>
        active &&
        setState({ key, error: error instanceof Error ? error : new Error(String(error)) }),
    );
    return () => {
      active = false;
    };
    // `key` identifies the request; `load` is recreated on every render.
    // oxlint-disable-next-line react/exhaustive-deps
  }, [key]);
  return state.key === key ? state : { key };
}
