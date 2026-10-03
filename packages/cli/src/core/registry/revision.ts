import { ShelfError } from "../errors";
import { isObject, parseJson } from "../json";
import { hashContent } from "../lock";
import { assertSafeRelativePath } from "../paths";
import { requireString, requireType } from "./validate";
import { MissingFileError } from "./open";
import type { RegistryItem, Registry } from "./types";
import { compareText } from "../format";

/** Everything a revision covers: exactly what installs. */
export type RevisionSnapshot = Pick<
  RegistryItem,
  "name" | "type" | "dependencies" | "shelfDependencies" | "files"
>;

export function revisionPath(revision: string): string {
  return `revisions/${revision}.json`;
}

export function snapshotOf(item: RevisionSnapshot): string {
  const { name, type, dependencies, shelfDependencies, files } = item;
  const snapshot = {
    name,
    type,
    dependencies,
    shelfDependencies,
    files: files.map(({ path, content }) => ({ path, content })),
  };
  return `${JSON.stringify(snapshot)}\n`;
}

/**
 * The item as it was at `revision`, from the registry's `revisions/` folder, or null if the
 * registry doesn't have it. A snapshot that doesn't hash to its revision is rejected.
 */
export async function readSnapshot(
  registry: Registry,
  revision: string,
): Promise<RevisionSnapshot | null> {
  const file = revisionPath(revision);
  let text: string;
  try {
    text = await registry.read(file);
  } catch (error) {
    if (error instanceof MissingFileError) return null;
    throw error;
  }
  const where = `Registry ${file}`;
  const raw = parseJson(text, where);
  const snapshot = isObject(raw) ? raw : {};
  const files = Array.isArray(snapshot["files"]) ? snapshot["files"] : [];
  const dependencies = isObject(snapshot["dependencies"]) ? snapshot["dependencies"] : {};
  const shelfDependencies = snapshot["shelfDependencies"];
  const parsed: RevisionSnapshot = {
    name: requireString(snapshot["name"], `${where}: "name"`),
    type: requireType(snapshot["type"], `${where}: "type"`),
    dependencies: Object.fromEntries(
      Object.entries(dependencies).map(([pkg, range]) => [
        pkg,
        requireString(range, `${where}: dependency "${pkg}"`),
      ]),
    ),
    shelfDependencies: Array.isArray(shelfDependencies)
      ? shelfDependencies.map((d, i) => requireString(d, `${where}: shelfDependencies[${i}]`))
      : [],
    files: files.map((entry: unknown, i: number) => {
      const fileEntry = isObject(entry) ? entry : {};
      const content = fileEntry["content"];
      if (typeof content !== "string") {
        throw new ShelfError(`${where}: files[${i}].content must be a string.`);
      }
      return {
        path: assertSafeRelativePath(fileEntry["path"], `${where}: files[${i}].path`),
        content,
      };
    }),
  };
  if (computeRevision(parsed) !== revision) {
    throw new ShelfError(
      `${where} does not hash to its revision; the registry copy was modified. Rebuild the registry with: shelf build`,
    );
  }
  return parsed;
}

export function computeRevision(item: RevisionSnapshot): string {
  const canonical = JSON.stringify({
    name: item.name,
    type: item.type,
    dependencies: Object.entries(item.dependencies).toSorted(([a], [b]) => compareText(a, b)),
    shelfDependencies: item.shelfDependencies.toSorted(),
    files: item.files
      .toSorted((a, b) => compareText(a.path, b.path))
      .map((file) => [file.path, file.content]),
  });
  return hashContent(canonical);
}
