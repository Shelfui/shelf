import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { type ShelfConfig, readConfig } from "./config";
import { compareText, plural } from "./format";
import { LOCK_FILE, type Lock, type LockedItem, hashContent, readLock } from "./lock";
import type { Output } from "./output";
import {
  type PackageManager,
  addHint,
  declaredPackages,
  detectPackageManager,
} from "./package-manager";
import { resolveInside } from "./paths";
import { type Registry, loadIndex, loadItem, projectRegistry } from "./registry";

export interface ItemStatus {
  name: string;
  modified: boolean;
  /** Installed files that differ from BASE or are missing, relative to the project. */
  modifiedFiles: string[];
  /** Shelf's current revision, or undefined when the item is no longer in the registry. */
  upstream: string | undefined;
  updateAvailable: boolean;
}

export interface Project {
  config: ShelfConfig;
  lock: Lock;
  registry: Registry;
}

export async function openProject(cwd: string): Promise<Project> {
  const config = await readConfig(cwd);
  return { config, lock: await readLock(cwd), registry: await projectRegistry(config, cwd) };
}

/**
 * Every installed item against the registry. A built registry lists each item's revision in
 * index.json, so this is one request; a source registry has its items read to compute them.
 */
export async function itemStatuses(
  cwd: string,
  { lock, registry }: Project,
): Promise<ItemStatus[]> {
  const index = new Map((await loadIndex(registry)).map((entry) => [entry.name, entry]));
  const statuses: ItemStatus[] = [];
  for (const [name, item] of Object.entries(lock.items).toSorted(([a], [b]) => compareText(a, b))) {
    const entry = index.get(name);
    const upstream = entry && (entry.revision ?? (await loadItem(registry, entry)).revision);
    const modified = await modifiedFiles(cwd, item);
    statuses.push({
      name,
      modified: modified.length > 0,
      modifiedFiles: modified,
      upstream,
      updateAvailable: upstream !== undefined && upstream !== item.revision,
    });
  }
  return statuses;
}

/** An item's installed files that differ from BASE or are missing, sorted. */
export async function modifiedFiles(cwd: string, item: LockedItem): Promise<string[]> {
  const modified: string[] = [];
  for (const [target, file] of Object.entries(item.files).toSorted(([a], [b]) =>
    compareText(a, b),
  )) {
    const absolute = resolveInside(cwd, target);
    if (!existsSync(absolute) || hashContent(await readFile(absolute)) !== file.baseHash) {
      modified.push(target);
    }
  }
  return modified;
}

export interface StatusOptions {
  cwd: string;
  names: string[];
  json?: boolean;
  out: Output;
}

export async function status({ cwd, names, json, out }: StatusOptions): Promise<void> {
  const project = await openProject(cwd);
  if (json) {
    await statusJson(cwd, project, names, out);
    return;
  }
  out.log("Shelf status");
  out.log();
  const all = await itemStatuses(cwd, project);
  const statuses = names.length > 0 ? all.filter((s) => names.includes(s.name)) : all;
  for (const name of names) {
    if (!project.lock.items[name]) out.log(`! ${name} is not installed. Run: shelf add ${name}`);
  }
  if (statuses.length === 0) {
    out.log(`Nothing installed yet (${LOCK_FILE} has no items). Run: shelf add button`);
    return;
  }

  const width = Math.max(...statuses.map((s) => s.name.length));
  for (const s of statuses) {
    const state = [
      ...(s.modified ? ["modified locally"] : []),
      s.upstream === undefined
        ? "removed from registry"
        : s.updateAvailable
          ? "update available"
          : "up to date",
    ];
    out.log(`  ${s.name.padEnd(width)}  ${state.join(", ")}`);
  }

  const updates = statuses.filter((s) => s.updateAvailable);
  await logRangeChanges(
    cwd,
    project,
    updates.map((s) => s.name),
    out,
  );
  out.log();
  if (updates.length === 0) {
    out.log(`✓ Everything is up to date (${plural(statuses.length, "item")}).`);
    return;
  }
  const merges = updates.filter((s) => s.modified).length;
  out.log(
    `${plural(updates.length, "update")} available${merges > 0 ? `, ${merges} with local changes to merge` : ""}. See: shelf diff <item>. Run: shelf update${names.length > 0 ? ` ${updates.map((s) => s.name).join(" ")}` : ""}`,
  );
}

/** Packages the project has whose range Shelf changed in an update. */
async function logRangeChanges(
  cwd: string,
  { lock, registry }: Project,
  names: string[],
  out: Output,
): Promise<void> {
  if (names.length === 0) return;
  const index = new Map((await loadIndex(registry)).map((entry) => [entry.name, entry]));
  const items = await Promise.all(names.map((name) => loadItem(registry, index.get(name)!)));
  const lines = rangeChanges(
    items,
    lock,
    await declaredPackages(cwd),
    await detectPackageManager(cwd),
  );
  for (const line of lines) out.log(line);
}

/**
 * Packages the project already declares whose range Shelf changed, with the command to follow
 * it. `shelf add` only installs missing packages, so these would otherwise drift silently.
 */
export function rangeChanges(
  items: Array<{ name: string; dependencies: Record<string, string> }>,
  lock: Lock,
  declared: Set<string>,
  pm: PackageManager,
): string[] {
  const lines: string[] = [];
  for (const item of items) {
    for (const [pkg, range] of Object.entries(item.dependencies)) {
      const previous = lock.items[item.name]?.dependencies[pkg];
      if (previous === undefined || previous === range || !declared.has(pkg)) continue;
      lines.push(
        `! ${item.name} now needs ${pkg}@${range} (was ${previous}). Run: ${addHint(pm, [`${pkg}@${range}`])}`,
      );
    }
  }
  return lines;
}

/**
 * Status as one JSON object, with the project context an agent needs before it adds anything.
 * Request headers are left out: they can hold a token.
 */
async function statusJson(
  cwd: string,
  project: Project,
  names: string[],
  out: Output,
): Promise<void> {
  const all = await itemStatuses(cwd, project);
  const statuses = names.length > 0 ? all.filter((s) => names.includes(s.name)) : all;
  const items = statuses.map((s) => ({
    name: s.name,
    revision: project.lock.items[s.name]?.revision ?? null,
    upstream: s.upstream ?? null,
    modified: s.modified,
    modifiedFiles: s.modifiedFiles,
    updateAvailable: s.updateAvailable,
    removedFromRegistry: s.upstream === undefined,
  }));
  const { config } = project;
  out.log(
    JSON.stringify(
      {
        project: {
          packageManager: await detectPackageManager(cwd),
          registry: config.registry,
          paths: config.paths,
          aliases: config.aliases,
        },
        items,
        notInstalled: names.filter((name) => !project.lock.items[name]),
        summary: {
          installed: items.length,
          modified: items.filter((s) => s.modified).length,
          updates: items.filter((s) => s.updateAvailable).length,
        },
      },
      null,
      2,
    ),
  );
}
