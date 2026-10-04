import { ShelfError } from "../errors";
import { isObject, parseJson } from "../json";
import { assertSafeRelativePath } from "../paths";
import { computeRevision } from "./revision";
import type { IndexEntry, Registry, RegistryItem } from "./types";
import { requireString, requireType } from "./validate";

const ITEM_NAME = /^[a-z0-9][a-z0-9-]*$/;
const PACKAGE_NAME = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
const PACKAGE_RANGE = /^[^\s-][^\s]*$/;
const REVISION = /^[0-9a-f]{64}$/;

export async function loadIndex(registry: Registry): Promise<IndexEntry[]> {
  const raw = parseJson(await registry.read("index.json"), "Registry index.json");
  if (!isObject(raw) || !Array.isArray(raw["items"])) {
    throw new ShelfError(`Registry index.json must be an object with an "items" array.`);
  }
  const seen = new Set<string>();
  const entries = raw["items"].map((entry: unknown, i: number) => {
    const where = `Registry index.json items[${i}]`;
    if (!isObject(entry)) throw new ShelfError(`${where} must be an object.`);
    const name = requireString(entry["name"], `${where}.name`);
    if (!ITEM_NAME.test(name)) {
      throw new ShelfError(
        `${where}.name "${name}" must be lowercase letters, digits, and dashes.`,
      );
    }
    if (seen.has(name)) throw new ShelfError(`Duplicate item "${name}" in registry index.json.`);
    seen.add(name);
    const keywords = optionalStrings(entry, "keywords", where);
    const useWhen = optionalString(entry, "useWhen", where);
    const avoidWhen = optionalString(entry, "avoidWhen", where);
    const related = optionalStrings(entry, "related", where);
    const status = entry["status"] === "experimental" ? ("experimental" as const) : undefined;
    if (entry["status"] !== undefined && !status) {
      throw new ShelfError(`${where}.status must be "experimental" when present.`);
    }
    return {
      name,
      type: requireType(entry["type"], `${where}.type`),
      description: requireString(entry["description"], `${where}.description`),
      path: assertSafeRelativePath(entry["path"], `${where}.path`),
      ...(typeof entry["revision"] === "string" &&
        REVISION.test(entry["revision"]) && { revision: entry["revision"] }),
      ...(keywords && { keywords }),
      ...(useWhen !== undefined && { useWhen }),
      ...(avoidWhen !== undefined && { avoidWhen }),
      ...(status && { status }),
      ...(related && { related }),
    };
  });
  for (const [i, entry] of entries.entries()) {
    const unknown = entry.related?.find((name) => !seen.has(name));
    if (unknown !== undefined) {
      throw new ShelfError(
        `Registry index.json items[${i}].related names "${unknown}", which is not an item in this registry.`,
      );
    }
  }
  return entries;
}

function optionalString(
  entry: Record<string, unknown>,
  key: string,
  where: string,
): string | undefined {
  const value = entry[key];
  return value === undefined ? undefined : requireString(value, `${where}.${key}`);
}

function optionalStrings(
  entry: Record<string, unknown>,
  key: string,
  where: string,
): string[] | undefined {
  const value = entry[key];
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw new ShelfError(`${where}.${key} must be an array of strings.`);
  return value.map((word: unknown, i: number) => requireString(word, `${where}.${key}[${i}]`));
}

export async function loadItem(registry: Registry, entry: IndexEntry): Promise<RegistryItem> {
  const where = `Registry item "${entry.name}" (${entry.path}/registry.json)`;
  const raw = parseJson(await registry.read(`${entry.path}/registry.json`), where);
  if (!isObject(raw)) throw new ShelfError(`${where} must be a JSON object.`);

  const name = requireString(raw["name"], `${where}: "name"`);
  if (name !== entry.name) {
    throw new ShelfError(
      `${where} is named "${name}", but index.json lists it as "${entry.name}".`,
    );
  }
  const type = requireType(raw["type"], `${where}: "type"`);
  if (type !== entry.type) {
    throw new ShelfError(`${where} has type "${type}", but index.json says "${entry.type}".`);
  }
  const description = requireString(raw["description"], `${where}: "description"`);

  const rawFiles = raw["files"];
  if (!Array.isArray(rawFiles) || rawFiles.length === 0) {
    throw new ShelfError(`${where}: "files" must be a non-empty array of { "path": string }.`);
  }
  const filePaths = rawFiles.map((file: unknown, i: number) => {
    if (!isObject(file)) throw new ShelfError(`${where}: files[${i}] must be an object.`);
    return assertSafeRelativePath(file["path"], `${where}: files[${i}].path`);
  });
  const duplicate = filePaths.find((p, i) => filePaths.indexOf(p) !== i);
  if (duplicate) throw new ShelfError(`${where}: file "${duplicate}" is listed twice.`);

  const rawDependencies = raw["dependencies"] ?? {};
  if (!isObject(rawDependencies)) {
    throw new ShelfError(
      `${where}: "dependencies" must be an object of package name to version range.`,
    );
  }
  const dependencies: Record<string, string> = {};
  for (const [pkg, range] of Object.entries(rawDependencies)) {
    if (!PACKAGE_NAME.test(pkg))
      throw new ShelfError(`${where}: "${pkg}" is not a valid package name.`);
    if (typeof range !== "string" || !PACKAGE_RANGE.test(range)) {
      throw new ShelfError(`${where}: dependency "${pkg}" needs a version range string.`);
    }
    dependencies[pkg] = range;
  }

  const rawShelfDependencies = raw["shelfDependencies"] ?? [];
  if (
    !Array.isArray(rawShelfDependencies) ||
    !rawShelfDependencies.every((d): d is string => typeof d === "string")
  ) {
    throw new ShelfError(`${where}: "shelfDependencies" must be an array of item names.`);
  }
  if (raw["figma"] !== undefined) {
    throw new ShelfError(
      `${where}: "figma" moved to index.json. Remove it here and add the node to "figma.nodes" in index.json.`,
    );
  }

  const files = await Promise.all(
    filePaths.map(async (filePath) => ({
      path: filePath,
      content: await registry.read(`${entry.path}/${filePath}`),
    })),
  );

  const item = {
    name,
    type,
    description,
    path: entry.path,
    files,
    dependencies,
    shelfDependencies: [...new Set(rawShelfDependencies)],
  };
  return { ...item, revision: computeRevision(item) };
}
