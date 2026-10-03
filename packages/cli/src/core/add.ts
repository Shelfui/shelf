import { existsSync } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { readBase } from "./base";
import { readConfig } from "./config";
import { ShelfError } from "./errors";
import { exec } from "./exec";
import { writeFileAtomic } from "./files";
import { listNames, plural, title } from "./format";
import { type MergeResult, mergeFile } from "./git";
import { type PlannedFile, planFiles } from "./install-plan";
import {
  LEGACY_BASE_DIR,
  LOCK_FILE,
  type Lock,
  type LockedItem,
  hashContent,
  readLock,
  writeLock,
} from "./lock";
import type { Output } from "./output";
import {
  type PackageManager,
  addArgs,
  declaredPackages,
  detectPackageManager,
} from "./package-manager";
import { resolveInside } from "./paths";
import { type RegistryItem, loadIndex, projectRegistry } from "./registry";
import { resolveItems } from "./resolve";
import { rangeChanges } from "./status";

export interface AddOptions {
  cwd: string;
  names: string[];
  overwrite: boolean;
  install: boolean;
  out: Output;
}

type Action = "create" | "unchanged" | "update" | "keep" | "merge" | "conflict";

interface FileChange extends PlannedFile {
  action: Action;
  reason?: string;
  /** For `merge`: your file with Shelf's changes applied, possibly with conflict markers. */
  merged?: MergeResult;
  reformatted?: boolean;
}

export async function add({ cwd, names, overwrite, install, out }: AddOptions): Promise<void> {
  if (names.length === 0) throw new ShelfError("Name at least one item. Example: shelf add button");

  const config = await readConfig(cwd);
  const lock = await readLock(cwd);
  const registry = await projectRegistry(config, cwd);
  const index = await loadIndex(registry);
  const resolved = await resolveItems(registry, index, names);
  // Imports resolve against every item, but installed dependencies stay as they are: they may
  // be modified locally, and updating them is an explicit `shelf add <name>`.
  const planned = planFiles(resolved, config);
  const requested = new Set(names);
  const installed = resolved.filter((item) => !requested.has(item.name) && lock.items[item.name]);
  const items = resolved.filter((item) => !installed.includes(item));
  const byRequest = (a: { name: string }, b: { name: string }) =>
    Number(!requested.has(a.name)) - Number(!requested.has(b.name));

  const files = planned.filter((file) => !installed.some((item) => item.name === file.item));
  const changes = await classify(cwd, files, lock, overwrite);
  const unrecoverable = await mergeAgainstBase(cwd, changes);
  refuseConflicts(changes, unrecoverable, overwrite);
  const changedItems = items
    .toSorted(byRequest)
    .filter((item) => itemChanged(item, lock.items[item.name], changes));

  out.log("Shelf");
  out.log();
  if (changedItems.length === 0) {
    for (const item of items) {
      out.log(`✓ ${item.name} is up to date (revision ${item.revision.slice(0, 12)})`);
    }
    logKept(changes, out);
    await removeLegacyBase(cwd, out);
    out.log();
    out.log("Nothing changed.");
    return;
  }
  for (const item of changedItems) out.log(`Adding ${item.name}`);
  out.log();
  out.log(
    `✓ resolved ${resolved
      .toSorted(byRequest)
      .map((item) => item.name)
      .join(", ")}`,
  );
  logInstalled(installed, lock, names, out);

  // Packages first: if installing fails, the project is untouched.
  const pm = await detectPackageManager(cwd);
  await addPackages(pm, cwd, items, install, out);
  await writeChanges(cwd, changes, out);
  logKept(changes, out);
  const conflicted = logMerges(changes, out);
  for (const line of rangeChanges(changedItems, lock, await declaredPackages(cwd), pm)) {
    out.log(line);
  }

  const dropped = recordProvenance(lock, changedItems, changes, config.registry);
  await writeLock(cwd, lock);
  await removeLegacyBase(cwd, out);
  out.log(`✓ recorded provenance in ${LOCK_FILE}`);
  logSummary(changedItems, changes, dropped, conflicted, out);
}

/** What writing Shelf's version would do to each file, from its hash and the lock's BASE. */
async function classify(
  cwd: string,
  planned: PlannedFile[],
  lock: Lock,
  overwrite: boolean,
): Promise<FileChange[]> {
  const changes: FileChange[] = [];
  for (const file of planned) {
    const absolute = resolveInside(cwd, file.target);
    const locked = lock.items[file.item]?.files[file.target];
    if (!existsSync(absolute)) {
      changes.push({ ...file, action: "create" });
      continue;
    }
    const currentHash = hashContent(await readFile(absolute));
    if (currentHash === hashContent(file.content)) {
      changes.push({ ...file, action: "unchanged" });
    } else if (locked && currentHash === locked.baseHash) {
      changes.push({ ...file, action: "update" });
    } else if (locked && hashContent(file.content) === locked.baseHash && !overwrite) {
      changes.push({ ...file, action: "keep" });
    } else if (locked && !overwrite) {
      changes.push({ ...file, action: "merge" });
    } else {
      changes.push({
        ...file,
        action: "conflict",
        reason: locked ? "modified locally" : "exists and was not installed by Shelf",
      });
    }
  }
  return changes;
}

/**
 * Merges files changed on both sides against BASE, in memory. Where BASE can't be recovered, the
 * files become conflicts, and the returned messages say why.
 */
async function mergeAgainstBase(cwd: string, changes: FileChange[]): Promise<string[]> {
  const unrecoverable: string[] = [];
  for (const [itemName, merges] of Map.groupBy(
    changes.filter((change) => change.action === "merge"),
    (change) => change.item,
  )) {
    let base: Map<string, string>;
    try {
      base = await readBase(
        cwd,
        itemName,
        merges.map((change) => change.target),
      );
    } catch (error) {
      if (!(error instanceof ShelfError)) throw error;
      unrecoverable.push(error.message);
      for (const change of merges) {
        change.action = "conflict";
        change.reason = "modified locally, and its BASE can't be recovered to merge";
      }
      continue;
    }
    for (const change of merges) {
      const local = await readFile(resolveInside(cwd, change.target), "utf8");
      const baseContent = base.get(change.target)!;
      change.merged = await mergeFile(local, baseContent, change.content);
      change.reformatted = isReformatted(baseContent, local);
    }
  }
  return unrecoverable;
}

function refuseConflicts(changes: FileChange[], unrecoverable: string[], overwrite: boolean) {
  const conflicts = changes.filter((change) => change.action === "conflict");
  if (conflicts.length === 0 || overwrite) return;
  const lines = conflicts.map((c) => `  ${c.target} (${c.item}: ${c.reason})`);
  throw new ShelfError(
    [
      `Refusing to overwrite ${plural(conflicts.length, "file")}:`,
      ...lines,
      ...unrecoverable,
      "Nothing was changed. Re-run with --overwrite to replace them with Shelf's version.",
    ].join("\n"),
  );
}

/** Whether the item's files, revision, or file list differ from what the lock records. */
function itemChanged(
  item: RegistryItem,
  locked: LockedItem | undefined,
  changes: FileChange[],
): boolean {
  if (!locked || locked.revision !== item.revision) return true;
  const itemChanges = changes.filter((change) => change.item === item.name);
  return (
    itemChanges.some((change) => change.action !== "unchanged" && change.action !== "keep") ||
    Object.keys(locked.files).toSorted().join() !==
      itemChanges
        .map((change) => change.target)
        .toSorted()
        .join()
  );
}

function logInstalled(installed: RegistryItem[], lock: Lock, names: string[], out: Output) {
  for (const item of installed) {
    if (lock.items[item.name]?.revision === item.revision) {
      out.log(`✓ kept your installed ${item.name}, Shelf has no newer version`);
    } else {
      out.log(
        `! kept your installed ${item.name}, but Shelf has a newer version that ${names.join(", ")} may need (update it with: shelf add ${item.name})`,
      );
    }
  }
}

async function addPackages(
  pm: PackageManager,
  cwd: string,
  items: RegistryItem[],
  install: boolean,
  out: Output,
): Promise<void> {
  const missing = await missingPackages(cwd, items);
  if (missing.length === 0) return;
  if (install) {
    await installPackages(pm, cwd, missing);
    out.log(`✓ installed ${missing.join(", ")} with ${pm}`);
  } else {
    out.log(`! skipped installing ${missing.join(", ")} (--skip-install)`);
  }
}

async function writeChanges(cwd: string, changes: FileChange[], out: Output): Promise<void> {
  for (const change of changes) {
    if (change.action === "unchanged" || change.action === "keep") continue;
    await writeFileAtomic(
      resolveInside(cwd, change.target),
      change.merged?.content ?? change.content,
    );
  }
  const count = (action: Action) => changes.filter((change) => change.action === action).length;
  if (count("create")) out.log(`✓ added ${plural(count("create"), "file")}`);
  if (count("update")) out.log(`✓ updated ${plural(count("update"), "file")}`);
  if (count("conflict")) {
    out.log(`✓ replaced ${plural(count("conflict"), "locally modified file")}`);
  }
}

/**
 * Writes each changed item's lock entry; returns the files Shelf's version no longer has. Runs
 * last, after files are written. BASE is recorded by hash only: its bytes are recoverable from
 * git history or the registry, so nothing is copied.
 */
function recordProvenance(
  lock: Lock,
  changedItems: RegistryItem[],
  changes: FileChange[],
  registry: LockedItem["registry"],
): string[] {
  const installedAt = new Date().toISOString();
  const dropped: string[] = [];
  for (const item of changedItems) {
    const itemFiles = changes.filter((change) => change.item === item.name);
    const targets = new Set(itemFiles.map((file) => file.target));
    for (const target of Object.keys(lock.items[item.name]?.files ?? {})) {
      if (!targets.has(target)) dropped.push(target);
    }
    lock.items[item.name] = {
      type: item.type,
      registry,
      path: item.path,
      revision: item.revision,
      installedAt,
      dependencies: item.dependencies,
      shelfDependencies: item.shelfDependencies,
      files: Object.fromEntries(
        itemFiles.map((file) => [
          file.target,
          { source: file.source, baseHash: hashContent(file.content) },
        ]),
      ),
    };
  }
  return dropped;
}

function logSummary(
  changedItems: RegistryItem[],
  changes: FileChange[],
  dropped: string[],
  conflicted: number,
  out: Output,
) {
  out.log();
  out.log(
    `${listNames(changedItems.map((item) => title(item.name)))} ${changedItems.length === 1 ? "is" : "are"} now yours.`,
  );
  for (const change of changes.filter((c) => c.action !== "unchanged" && c.action !== "keep")) {
    out.log(`  ${change.target}`);
  }
  if (dropped.length > 0) {
    out.log();
    out.log(`! No longer part of Shelf's version, kept as your own (delete if unused):`);
    for (const file of dropped) out.log(`  ${file}`);
  }
  if (conflicted > 0) {
    out.log();
    out.log(`Resolve the conflicts between <<<<<<< yours and >>>>>>> shelf, then run: shelf check`);
  }
}

function logKept(changes: FileChange[], out: Output) {
  for (const change of changes) {
    if (change.action !== "keep") continue;
    out.log(`✓ kept your modified ${change.target}, Shelf's version has not changed`);
  }
}

async function removeLegacyBase(cwd: string, out: Output): Promise<void> {
  const legacy = path.join(cwd, LEGACY_BASE_DIR);
  if (!existsSync(legacy)) return;
  await rm(legacy, { recursive: true, force: true });
  out.log(`✓ removed ${LEGACY_BASE_DIR}/, BASE is now recovered from git history or the registry`);
}

/** Reports each merge; returns how many files were left with conflicts. */
function logMerges(changes: FileChange[], out: Output): number {
  let conflicted = 0;
  for (const change of changes) {
    if (!change.merged) continue;
    const { conflicts } = change.merged;
    if (conflicts === 0) {
      out.log(`✓ merged Shelf's changes into your modified ${change.target}`);
      continue;
    }
    conflicted++;
    const hint = change.reformatted
      ? `; most of the file differs from BASE, likely reformatted. See: shelf diff ${change.item} --local`
      : "";
    out.log(`! merged ${change.target} with ${plural(conflicts, "conflict")}${hint}`);
  }
  return conflicted;
}

/** Whether fewer than half of BASE's non-blank lines survive in your file, as after a formatter. */
function isReformatted(base: string, local: string): boolean {
  const yours = new Set(local.split("\n").map((line) => line.trimEnd()));
  const lines = base.split("\n").filter((line) => line.trim() !== "");
  const kept = lines.filter((line) => yours.has(line.trimEnd())).length;
  return kept * 2 < lines.length;
}

async function missingPackages(
  cwd: string,
  items: Array<{ dependencies: Record<string, string> }>,
): Promise<string[]> {
  const present = await declaredPackages(cwd);
  const wanted = new Map<string, string>();
  for (const item of items) {
    for (const [pkg, range] of Object.entries(item.dependencies)) {
      if (!present.has(pkg) && !wanted.has(pkg)) wanted.set(pkg, range);
    }
  }
  return [...wanted].map(([pkg, range]) => `${pkg}@${range}`).toSorted();
}

async function installPackages(pm: PackageManager, cwd: string, specs: string[]): Promise<void> {
  const argv = addArgs(pm, specs);
  const command =
    pm === "bun" && process.versions["bun"] ? [process.execPath, ...argv.slice(1)] : argv;
  const { stdout, stderr, exitCode } = await exec(command, {
    cwd,
    env: { ...process.env, NO_COLOR: "1" },
  });
  if (exitCode !== 0) {
    const detail = `${stdout}\n${stderr}`.trim().split("\n").slice(-15).join("\n");
    throw new ShelfError(
      `${argv.join(" ")} failed (exit ${exitCode}). No files were written.\n${detail}`,
    );
  }
}
