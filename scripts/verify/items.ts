import { readFile } from "node:fs/promises";
import path from "node:path";

export const repoRoot = path.resolve(import.meta.dirname, "../..");
export const registryDir = path.join(repoRoot, "registry");

export interface Item {
  name: string;
  type: string;
  /** From the registry root, such as `components/button`. */
  path: string;
  /** Absolute. */
  dir: string;
  /** The files `shelf add` copies, absolute. */
  files: string[];
  /** Package names from `dependencies`. */
  packages: string[];
  shelfDependencies: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry) => typeof entry === "string") : [];
}

async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await readFile(file, "utf8"));
}

/** Every item in `registry/index.json`, with what its `registry.json` lists. */
export async function loadItems(): Promise<Item[]> {
  const index = await readJson(path.join(registryDir, "index.json"));
  if (!isRecord(index) || !Array.isArray(index["items"])) {
    throw new Error("registry/index.json must be an object with an items array.");
  }
  const items: Item[] = [];
  for (const entry of index["items"]) {
    if (!isRecord(entry)) continue;
    const { name, type, path: itemPath } = entry;
    if (typeof name !== "string" || typeof type !== "string" || typeof itemPath !== "string") {
      throw new Error("Every registry/index.json item needs a name, type, and path.");
    }
    const dir = path.join(registryDir, itemPath);
    const manifest = await readJson(path.join(dir, "registry.json"));
    if (!isRecord(manifest)) throw new Error(`${itemPath}/registry.json must be an object.`);
    const files = Array.isArray(manifest["files"]) ? manifest["files"] : [];
    items.push({
      name,
      type,
      path: itemPath,
      dir,
      files: files.flatMap((file) =>
        isRecord(file) && typeof file["path"] === "string" ? [path.join(dir, file["path"])] : [],
      ),
      packages: isRecord(manifest["dependencies"]) ? Object.keys(manifest["dependencies"]) : [],
      shelfDependencies: strings(manifest["shelfDependencies"]),
    });
  }
  return items;
}

export const isSource = (file: string) => /\.(?:ts|tsx)$/.test(file) && !file.endsWith(".d.ts");
