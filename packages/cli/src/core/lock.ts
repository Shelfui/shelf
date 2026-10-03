import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ShelfError } from "./errors";
import { writeFileAtomic } from "./files";
import { isObject, parseJson, stableStringify } from "./json";
import { assertSafeRelativePath } from "./paths";

export const SHELF_DIR = ".shelf";
export const LOCK_FILE = ".shelf/lock.json";
/** Where Shelf used to keep copies of installed files; removed as items are re-added. */
export const LEGACY_BASE_DIR = ".shelf/base";

const SHA256 = /^[0-9a-f]{64}$/;

export interface LockedFile {
  /** Path inside the registry item, e.g. `button.tsx`. */
  source: string;
  /** sha256 of the exact bytes Shelf installed (BASE). */
  baseHash: string;
}

export interface LockedItem {
  type: string;
  /** Registry location as written in shelf.config.json. */
  registry: string;
  /** Item directory inside the registry. */
  path: string;
  revision: string;
  installedAt: string;
  dependencies: Record<string, string>;
  shelfDependencies: string[];
  /** Keyed by path relative to the project, e.g. `src/components/ui/button.tsx`. */
  files: Record<string, LockedFile>;
}

export interface Lock {
  version: 1;
  items: Record<string, LockedItem>;
}

export function emptyLock(): Lock {
  return { version: 1, items: {} };
}

export function hashContent(content: string | Uint8Array): string {
  return createHash("sha256").update(content).digest("hex");
}

export async function readLock(cwd: string): Promise<Lock> {
  const file = path.join(cwd, LOCK_FILE);
  if (!existsSync(file)) return emptyLock();
  const raw = parseJson(
    await readFile(file, "utf8"),
    LOCK_FILE,
    "Restore it from version control; Shelf will not guess its contents.",
  );
  return validateLock(raw);
}

function invalidLock(detail: string): ShelfError {
  return new ShelfError(`${LOCK_FILE} is invalid: ${detail}. Restore it from version control.`);
}

function lockString(item: Record<string, unknown>, key: string, name: string): string {
  const value = item[key];
  if (typeof value !== "string") throw invalidLock(`item "${name}" is missing "${key}"`);
  return value;
}

function validateLock(raw: unknown): Lock {
  if (!isObject(raw) || raw["version"] !== 1 || !isObject(raw["items"])) {
    throw invalidLock(`expected { "version": 1, "items": { ... } }`);
  }
  const items: Record<string, LockedItem> = {};
  for (const [name, item] of Object.entries(raw["items"])) {
    if (!isObject(item) || !isObject(item["files"])) {
      throw invalidLock(`item "${name}" has no "files" object`);
    }
    const files: Record<string, LockedFile> = {};
    for (const [target, file] of Object.entries(item["files"])) {
      assertSafeRelativePath(target, `${LOCK_FILE} file path`);
      if (
        !isObject(file) ||
        typeof file["baseHash"] !== "string" ||
        typeof file["source"] !== "string"
      ) {
        throw invalidLock(`file "${target}" of "${name}" needs "source" and "baseHash"`);
      }
      if (!SHA256.test(file["baseHash"])) {
        throw invalidLock(`file "${target}" of "${name}" has a malformed baseHash`);
      }
      files[target] = {
        source: assertSafeRelativePath(file["source"], `${LOCK_FILE} source path`),
        baseHash: file["baseHash"],
      };
    }
    const revision = lockString(item, "revision", name);
    if (!SHA256.test(revision)) throw invalidLock(`item "${name}" has a malformed revision`);
    items[name] = {
      type: lockString(item, "type", name),
      registry: lockString(item, "registry", name),
      path: lockString(item, "path", name),
      revision,
      installedAt: lockString(item, "installedAt", name),
      dependencies: lockDependencies(item["dependencies"], name),
      shelfDependencies: lockShelfDependencies(item["shelfDependencies"], name),
      files,
    };
  }
  return { version: 1, items };
}

function lockDependencies(value: unknown, name: string): Record<string, string> {
  if (value === undefined) return {};
  const entries = isObject(value) ? Object.entries(value) : [];
  const ranges = entries.filter((entry): entry is [string, string] => typeof entry[1] === "string");
  if (!isObject(value) || ranges.length !== entries.length) {
    throw invalidLock(`item "${name}" has malformed "dependencies"`);
  }
  return Object.fromEntries(ranges);
}

function lockShelfDependencies(value: unknown, name: string): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((dependency) => typeof dependency !== "string")) {
    throw invalidLock(`item "${name}" has malformed "shelfDependencies"`);
  }
  return value;
}

/** Writes the lock with sorted keys so identical state always produces identical bytes. */
export async function writeLock(cwd: string, lock: Lock): Promise<void> {
  await writeFileAtomic(path.join(cwd, LOCK_FILE), `${stableStringify(lock)}\n`);
}
