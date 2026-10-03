import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  type RegistryAuth,
  isHttpRegistry,
  readConfig,
  registryAuth,
  resolveRegistryLocation,
} from "./config";
import { ShelfError } from "./errors";
import { plural } from "./format";
import { fileVersions, registryHistory } from "./git";
import { installedContent } from "./install-plan";
import { LOCK_FILE, type Lock, hashContent, readLock } from "./lock";
import { resolveInside } from "./paths";
import { type RevisionSnapshot, loadIndex, loadItem, openRegistry, readSnapshot } from "./registry";

/**
 * The files of an installed item exactly as Shelf installed them (BASE), keyed by project path.
 *
 * The lock identifies BASE by hash; the bytes come from the first place that has them: the
 * file itself if unmodified, the project's git history, or the item's revision in the registry
 * rebuilt the way `shelf add` wrote it. Every result is checked against its `baseHash`.
 */
export async function readBase(
  cwd: string,
  itemName: string,
  only?: string[],
): Promise<Map<string, string>> {
  const lock = await readLock(cwd);
  const locked = lock.items[itemName];
  if (!locked)
    throw new ShelfError(`${itemName} is not installed: it has no entry in ${LOCK_FILE}.`);

  const base = new Map<string, string>();
  const missing: string[] = [];
  for (const [target, file] of Object.entries(locked.files)) {
    if (only && !only.includes(target)) continue;
    const found = await fromProject(cwd, target, file.baseHash);
    if (found === null) missing.push(target);
    else base.set(target, found);
  }
  if (missing.length === 0) return base;

  const revision = locked.revision.slice(0, 12);
  const config = await readConfig(cwd);
  const location = resolveRegistryLocation(locked.registry, cwd);
  const auth = locked.registry === config.registry ? await registryAuth(config, cwd) : undefined;
  const snapshot = await findRevision(location, itemName, locked.revision, auth);
  if (!snapshot) {
    throw new ShelfError(
      `Can't recover BASE for ${plural(missing.length, "file")} of ${itemName} (${missing.join(", ")}): not in this project's git history, and revision ${revision} is not in the registry at ${location}. Commit right after shelf add to keep an exact BASE.`,
    );
  }
  const rebuilt = replay(lock, itemName, snapshot, config.aliases);
  for (const target of missing) {
    const content = rebuilt.get(target);
    if (content === undefined || hashContent(content) !== locked.files[target]!.baseHash) {
      throw new ShelfError(
        `Can't recover BASE for ${target}: rebuilding revision ${revision} of ${itemName} gives different bytes than were installed, most likely because "aliases" in shelf.config.json or an installed dependency changed since. Commit right after shelf add to keep an exact BASE.`,
      );
    }
    base.set(target, content);
  }
  return base;
}

async function fromProject(cwd: string, target: string, baseHash: string): Promise<string | null> {
  const absolute = resolveInside(cwd, target);
  if (existsSync(absolute)) {
    const current = await readFile(absolute);
    if (hashContent(current) === baseHash) return current.toString("utf8");
  }
  for await (const version of fileVersions(cwd, target)) {
    if (hashContent(version) === baseHash) return version.toString("utf8");
  }
  return null;
}

async function findRevision(
  location: string,
  name: string,
  revision: string,
  auth: RegistryAuth | undefined,
): Promise<RevisionSnapshot | null> {
  if (!isHttpRegistry(location) && !existsSync(location)) return null;
  const registry = openRegistry(location, auth);
  const snapshot = await readSnapshot(registry, revision);
  if (snapshot || isHttpRegistry(location)) return snapshot;

  const entry = (await loadIndex(registry).catch(() => [])).find((e) => e.name === name);
  const current = entry ? await loadItem(registry, entry).catch(() => null) : null;
  if (current?.revision === revision) return current;
  return (await registryHistory(location, name)).find((item) => item.revision === revision) ?? null;
}

/** Writes the snapshot's files the way `shelf add` did, using the install layout in the lock. */
function replay(
  lock: Lock,
  name: string,
  snapshot: RevisionSnapshot,
  aliases: Record<string, string>,
): Map<string, string> {
  const targets = new Map<string, string>();
  for (const item of Object.values(lock.items)) {
    for (const [target, file] of Object.entries(item.files)) {
      targets.set(path.posix.join(item.path, file.source), target);
    }
  }
  const locked = lock.items[name]!;
  const rebuilt = new Map<string, string>();
  for (const file of snapshot.files) {
    const registryPath = path.posix.join(locked.path, file.path);
    const target = targets.get(registryPath);
    if (!target) continue;
    try {
      rebuilt.set(
        target,
        installedContent(file.content, registryPath, target, targets, name, aliases),
      );
    } catch {
      // An import that no longer resolves against the installed layout: not rebuildable.
    }
  }
  return rebuilt;
}
