import { existsSync } from "node:fs";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_PATHS } from "./config";
import { docsFiles, readTopics, type DocsTopic } from "./docs";
import { ShelfError } from "./errors";
import { findFiles } from "./files";
import { plural } from "./format";
import { type HistoryItem, type HistoryStatus, historyStatus, registryHistory } from "./git";
import { planFiles } from "./install-plan";
import { isObject, parseJson } from "./json";
import type { Output } from "./output";
import {
  type IndexEntry,
  figmaLink,
  loadIndex,
  openRegistry,
  parseFigmaLinks,
  revisionPath,
  snapshotOf,
} from "./registry";
import { resolveItems } from "./resolve";

export interface BuildOptions {
  cwd: string;
  /** The registry source directory. */
  source: string;
  /** Where the static registry is written. Replaced on every build, except `revisions/`. */
  outDir: string;
  out: Output;
  /** Write the Shelf Registry site next to the registry files. Defaults to true. */
  site?: boolean;
  /** The prebuilt site. Defaults to the one shipped with the CLI. */
  siteDir?: string;
  /** The built Figma plugin (manifest and code), served at `figma/`. Defaults to the one shipped with the CLI. */
  figmaDir?: string;
  /** A Storybook build (`storybook build`) to serve at `storybook/`, for previews. */
  storybook?: string;
  /** A `shelf usage --json` file to serve at `usage.json`. */
  usage?: string;
  /** A `bun run verify` report to serve at `verify.json`. */
  verify?: string;
}

/**
 * Validates a registry the way `shelf add` reads it, then writes only the files that
 * install (`index.json`, each `registry.json`, and the files it lists) to `outDir`.
 * The output has the same layout, so any static host can serve it.
 *
 * It also writes `revisions/<revision>.json` for every revision the items have had in git, so
 * consumers can rebuild what they installed. Snapshots are never deleted or rewritten.
 */
export async function build({
  cwd,
  source,
  outDir,
  out,
  site = true,
  siteDir = defaultSiteDir(),
  figmaDir = defaultFigmaDir(),
  storybook,
  usage,
  verify,
}: BuildOptions): Promise<void> {
  const root = path.resolve(cwd, source);
  const storybookDir = storybook === undefined ? undefined : path.resolve(cwd, storybook);
  if (storybookDir && !existsSync(path.join(storybookDir, "iframe.html"))) {
    throw new ShelfError(
      `${storybookDir} is not a Storybook build (no iframe.html). Run: storybook build, then pass its output, usually storybook-static.`,
    );
  }
  const usageJson = usage === undefined ? undefined : await readUsage(path.resolve(cwd, usage));
  const verifyJson = verify === undefined ? undefined : await readVerify(path.resolve(cwd, verify));
  const target = path.resolve(cwd, outDir);
  if (isInside(target, root) || isInside(root, target)) {
    throw new ShelfError(
      `The output directory ${target} overlaps the registry ${root}. Choose an --out outside it.`,
    );
  }
  if (existsSync(target) && !existsSync(path.join(target, "index.json"))) {
    if ((await readdir(target)).length > 0) {
      throw new ShelfError(
        `${target} is not empty and is not a Shelf registry build. Choose another --out, or empty it.`,
      );
    }
  }

  if (!existsSync(path.join(root, "index.json"))) {
    throw new ShelfError(
      `No index.json in ${root}. Pass the registry directory: shelf build <dir>`,
    );
  }
  const registry = openRegistry(root);
  const index = await loadIndex(registry);
  const sourceIndex = parseJson(await registry.read("index.json"), "Registry index.json");
  const figmaLinks = parseFigmaLinks(sourceIndex, index);
  const unindexed = await unindexedItems(root, new Set(index.map((entry) => entry.path)));
  if (unindexed.length > 0) {
    throw new ShelfError(
      `${plural(unindexed.length, "item")} not listed in index.json: ${unindexed.join(", ")}. Add them to index.json or remove them.`,
    );
  }
  const items = await resolveItems(
    registry,
    index,
    index.map((entry) => entry.name),
  );
  const byName = new Map(items.map((item) => [item.name, item]));
  for (const item of items) {
    const closure = new Set([item.name]);
    for (const name of closure) {
      for (const dependency of byName.get(name)!.shelfDependencies) closure.add(dependency);
    }
    planFiles(
      items.filter((other) => closure.has(other.name)),
      { paths: DEFAULT_PATHS, aliases: {} },
    );
  }

  for (const entry of existsSync(target) ? await readdir(target) : []) {
    if (entry !== REVISIONS) await rm(path.join(target, entry), { recursive: true, force: true });
  }
  const publishedIndex = {
    ...(isObject(sourceIndex) ? sourceIndex : {}),
    items: index.map((entry) => {
      const { revision, dependencies, shelfDependencies } = byName.get(entry.name)!;
      const figma = figmaLinks && figmaLink(figmaLinks, entry);
      return { ...entry, revision, dependencies, shelfDependencies, ...(figma && { figma }) };
    }),
  };
  const topics = await readTopics(registry);
  const files: Array<[string, string]> = [
    ["index.json", `${JSON.stringify(publishedIndex, null, 2)}\n`],
    ["llms.txt", llmsTxt(index, topics)],
  ];
  if (usageJson !== undefined) files.push(["usage.json", usageJson]);
  if (verifyJson !== undefined) files.push(["verify.json", verifyJson]);
  files.push(...(await docsFiles(registry)));
  for (const item of items) {
    files.push([`${item.path}/registry.json`, await registry.read(`${item.path}/registry.json`)]);
    for (const file of item.files) files.push([`${item.path}/${file.path}`, file.content]);
  }
  let bytes = 0;
  for (const [relative, content] of files) {
    const absolute = path.join(target, relative);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, content);
    bytes += Buffer.byteLength(content);
  }

  const status = await historyStatus(root);
  const history = status === "available" ? await registryHistory(root) : [];
  let written = 0;
  for (const item of [...items, ...history]) {
    const absolute = path.join(target, revisionPath(item.revision));
    if (existsSync(absolute)) continue;
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, snapshotOf(item));
    written++;
  }
  const kept = (await readdir(path.join(target, REVISIONS))).length;
  await writeFile(path.join(target, "history.json"), historyJson(history));

  const siteBuilt = site && existsSync(path.join(siteDir, "index.html"));
  if (siteBuilt) await cp(siteDir, target, { recursive: true });
  // The plugin's window is the site, so one is only useful with the other.
  const figmaBuilt = siteBuilt && existsSync(path.join(figmaDir, "manifest.json"));
  if (figmaBuilt) await cp(figmaDir, path.join(target, FIGMA), { recursive: true });
  if (storybookDir) await cp(storybookDir, path.join(target, STORYBOOK), { recursive: true });

  out.log("Shelf build");
  out.log();
  out.log(`✓ validated ${plural(items.length, "item")}`);
  out.log(`✓ wrote ${plural(files.length, "file")} (${(bytes / 1024).toFixed(1)} kB) to ${target}`);
  out.log(`✓ ${plural(kept, "revision")} in ${REVISIONS}/ (${written} new)`);
  if (siteBuilt) out.log("✓ site at index.html");
  if (figmaBuilt) out.log(`✓ Figma plugin at ${FIGMA}/`);
  if (storybookDir) out.log(`✓ Storybook at ${STORYBOOK}/`);
  if (usageJson !== undefined) out.log("✓ usage at usage.json");
  if (verifyJson !== undefined) out.log("✓ verification at verify.json");
  if (site && !siteBuilt) out.log("! site not built, run: bun run site:build");
  if (site && siteBuilt && !figmaBuilt) {
    out.log("! Figma plugin not built, run: bun run figma:build");
  }
  if (status !== "available") {
    out.log(
      `! registry history unavailable (${UNAVAILABLE[status]}); installs of older revisions can't be rebuilt.${status === "shallow" ? " Use fetch-depth: 0." : ""}`,
    );
  }
  out.log();
  out.log(
    `Serve it from any static host, or locally: shelf serve ${path.relative(cwd, target) || "."}`,
  );
}

const REVISIONS = "revisions";
const STORYBOOK = "storybook";
const FIGMA = "figma";

/** Next to the bundled CLI in `dist/`, or in `dist/` when running from source. */
function defaultFigmaDir(): string {
  const bundled = fileURLToPath(new URL("./figma", import.meta.url));
  return existsSync(bundled)
    ? bundled
    : fileURLToPath(new URL("../../dist/figma", import.meta.url));
}

/** Next to the bundled CLI in `dist/`, or in `dist/` when running from source. */
function defaultSiteDir(): string {
  const bundled = fileURLToPath(new URL("./site", import.meta.url));
  return existsSync(bundled) ? bundled : fileURLToPath(new URL("../../dist/site", import.meta.url));
}

async function readUsage(file: string): Promise<string> {
  const content = await readFile(file, "utf8").catch(() => {
    throw new ShelfError(`Can't read ${file}. Write it with: shelf usage --json > ${file}`);
  });
  const graph = parseJson(content, file, `Write it with: shelf usage --json > ${file}`);
  if (!isObject(graph) || graph["version"] !== 1 || !Array.isArray(graph["projects"])) {
    throw new ShelfError(`${file} is not shelf usage output. Write it with: shelf usage --json`);
  }
  return content;
}

async function readVerify(file: string): Promise<string> {
  const fix = `Write it with: bun run verify --out ${file}`;
  const content = await readFile(file, "utf8").catch(() => {
    throw new ShelfError(`Can't read ${file}. ${fix}`);
  });
  const report = parseJson(content, file, fix);
  if (!isObject(report) || report["version"] !== 1 || !isObject(report["items"])) {
    throw new ShelfError(`${file} is not a verify report. ${fix}`);
  }
  return content;
}

/** Each item's revisions, newest first, with the commit that introduced them. */
function historyJson(history: HistoryItem[]): string {
  const items: Record<string, Array<{ revision: string; commit: string; date: string }>> = {};
  for (const { name, revision, commit, date } of history) {
    (items[name] ??= []).unshift({ revision, commit, date });
  }
  return `${JSON.stringify({ items })}\n`;
}

/** An index for agents: https://llmstxt.org */
function llmsTxt(index: IndexEntry[], topics: DocsTopic[]): string {
  const types = [...new Set(index.map((entry) => entry.type))].toSorted();
  const lines = [
    "# Shelf Registry",
    "",
    "> React components, patterns, blocks, and templates built on Base UI and StyleX. Installing an item copies normal source into your project, which then owns it.",
    "",
    "Install the CLI once per project (`bun add -d @shelfui/cli`); its command is `shelf`. Then install from this registry with the URL of this directory:",
    "",
    "- `bunx shelf init --registry <url>` once per project",
    "- `bunx shelf add <name>` for each item; Shelf dependencies and packages come along",
    "- `bunx shelf check` to validate installed items",
    "- `bunx shelf docs <topic or item>` prints documentation as Markdown",
    "",
    "Links are relative to this file. Each item's `registry.json` lists its files, packages, and Shelf dependencies. `index.json` lists every item.",
  ];
  if (topics.length > 0) {
    lines.push("", "## docs", "");
    for (const t of topics) lines.push(`- [${t.title}](docs/${t.path}): ${t.description}`);
  }
  for (const type of types) {
    lines.push("", `## ${type}`, "");
    for (const entry of index.filter((item) => item.type === type)) {
      const use = entry.useWhen === undefined ? "" : ` Use when: ${entry.useWhen}`;
      const tag = entry.status ? " (experimental)" : "";
      lines.push(`- [${entry.name}](${entry.path}/registry.json)${tag}: ${entry.description}${use}`);
    }
  }
  return `${lines.join("\n")}\n`;
}

const UNAVAILABLE: Record<Exclude<HistoryStatus, "available">, string> = {
  shallow: "shallow clone",
  untracked: "not committed to git",
  "no-git": "not a git repository",
};

function isInside(child: string, parent: string): boolean {
  return child === parent || child.startsWith(parent + path.sep);
}

async function unindexedItems(root: string, indexed: Set<string>): Promise<string[]> {
  const files = await findFiles(root, (name) => name === "registry.json");
  return files.map((file) => path.posix.dirname(file)).filter((dir) => !indexed.has(dir));
}
