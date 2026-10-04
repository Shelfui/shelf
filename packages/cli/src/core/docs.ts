import { readConfig, resolveRegistryLocation } from "./config";
import { ShelfError } from "./errors";
import { compareText } from "./format";
import { isObject, parseJson } from "./json";
import type { Output } from "./output";
import { assertSafeRelativePath } from "./paths";
import { type Registry, loadIndex, loadItem, openRegistry, projectRegistry } from "./registry";
import { requireString } from "./registry/validate";

/** Where a registry lists its documentation, relative to the registry root. */
export const DOCS_INDEX = "docs/index.json";

export interface DocsTopic {
  topic: string;
  title: string;
  description: string;
  /** The Markdown file, relative to `docs/`. */
  path: string;
}

/**
 * The topics a registry publishes: Markdown files in `docs/`, listed in `docs/index.json`.
 * A registry without documentation has none.
 */
export async function readTopics(registry: Registry): Promise<DocsTopic[]> {
  let text: string;
  try {
    text = await registry.read(DOCS_INDEX);
  } catch {
    return [];
  }
  const raw = parseJson(text, `Registry ${DOCS_INDEX}`);
  if (!isObject(raw) || !Array.isArray(raw["topics"])) {
    throw new ShelfError(`Registry ${DOCS_INDEX} must be an object with a "topics" array.`);
  }
  return raw["topics"].map((entry: unknown, i: number) => {
    const where = `Registry ${DOCS_INDEX} topics[${i}]`;
    if (!isObject(entry)) throw new ShelfError(`${where} must be an object.`);
    return {
      topic: requireString(entry["topic"], `${where}.topic`),
      title: requireString(entry["title"], `${where}.title`),
      description: requireString(entry["description"], `${where}.description`),
      path: assertSafeRelativePath(entry["path"], `${where}.path`),
    };
  });
}

/** The files `shelf build` copies for documentation: the index and every topic it lists. */
export async function docsFiles(registry: Registry): Promise<Array<[string, string]>> {
  const topics = await readTopics(registry);
  if (topics.length === 0) return [];
  const files: Array<[string, string]> = [[DOCS_INDEX, await registry.read(DOCS_INDEX)]];
  for (const { path, topic } of topics) {
    const file = `docs/${path}`;
    try {
      files.push([file, await registry.read(file)]);
    } catch {
      throw new ShelfError(`${DOCS_INDEX} lists "${topic}", but ${file} is missing.`);
    }
  }
  return files;
}

export interface DocsOptions {
  cwd: string;
  topic: string | undefined;
  registry: string | undefined;
  out: Output;
}

/**
 * Prints documentation as Markdown. A topic is a page the registry publishes; an item name
 * prints that item's description, dependencies, and source, which carries its usage notes.
 */
export async function docs({ cwd, topic, registry: location, out }: DocsOptions): Promise<void> {
  const registry = location
    ? openRegistry(resolveRegistryLocation(location, cwd))
    : await projectRegistry(await readConfig(cwd), cwd);
  const topics = await readTopics(registry);

  if (topic === undefined) {
    const index = await loadIndex(registry);
    out.log("Topics");
    out.log();
    if (topics.length === 0) out.log("  (this registry publishes no topic pages)");
    const width = Math.max(0, ...topics.map((t) => t.topic.length));
    for (const t of topics) out.log(`  ${t.topic.padEnd(width)}  ${t.description}`);
    out.log();
    out.log(`Items: ${index.length}. Run: shelf docs <topic> or shelf docs <item>`);
    out.log(
      `       ${index
        .map((entry) => entry.name)
        .toSorted(compareText)
        .join(", ")}`,
    );
    return;
  }

  const found = topics.find((t) => t.topic === topic);
  if (found) {
    out.log((await registry.read(`docs/${found.path}`)).trimEnd());
    return;
  }

  const entry = (await loadIndex(registry)).find((item) => item.name === topic);
  if (!entry) {
    throw new ShelfError(`No docs for "${topic}". Run: shelf docs (lists topics and items)`);
  }
  const item = await loadItem(registry, entry);
  const lines = [`# ${item.name}`, "", item.description, "", `Type: ${item.type}`];
  if (entry.status) lines.push(`Status: ${entry.status}. The API may change.`);
  if (entry.useWhen !== undefined) lines.push(`Use when: ${entry.useWhen}`);
  if (entry.avoidWhen !== undefined) lines.push(`Avoid when: ${entry.avoidWhen}`);
  if (entry.related) lines.push(`Related: ${entry.related.join(", ")}`);
  lines.push("");
  lines.push("Install:", "", "```bash", `shelf add ${item.name}`, "```", "");
  const packages = Object.entries(item.dependencies).map(([pkg, range]) => `${pkg}@${range}`);
  lines.push(`Packages: ${packages.length > 0 ? packages.join(", ") : "none"}`);
  lines.push(
    `Shelf items: ${item.shelfDependencies.length > 0 ? item.shelfDependencies.join(", ") : "none"}`,
    "",
  );
  for (const file of item.files) {
    const lang = file.path.endsWith(".json") ? "json" : file.path.endsWith(".css") ? "css" : "tsx";
    lines.push(`## ${file.path}`, "", `\`\`\`${lang}`, file.content.trimEnd(), "```", "");
  }
  out.log(lines.join("\n").trimEnd());
}
