/**
 * Keeps each item's `dependencies` and `shelfDependencies` in sync with what its files import.
 *
 *   bun run deps          Report drift and exit 1 when registry.json files are wrong.
 *   bun run deps --fix    Rewrite the registry.json files that drifted.
 *
 * Package versions come from the root package.json, so a version is chosen in one place.
 * `react` and `react-dom` are peers of the consumer and are never listed.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { builtinModules } from "node:module";
import { parseArgs } from "node:util";
import { specifiers } from "../packages/cli/src/core/imports";
import { loadItems, repoRoot, type Item } from "./verify/items";

const { values: flags } = parseArgs({ options: { fix: { type: "boolean", default: false } } });

const PEERS = new Set(["react", "react-dom"]);
/** Subpath imports that only work when a package's optional dependencies are installed. */
const IMPLIED: Record<string, string[]> = {
  "@tiptap/react/menus": ["@tiptap/extension-bubble-menu", "@tiptap/extension-floating-menu"],
};
const SCANNED = /\.(?:tsx?|css)$/;
const RESOLVE = ["", ".ts", ".tsx", ".css", "/index.ts", "/index.tsx"];

/** `@scope/name/sub` → `@scope/name`, `name/sub` → `name`. */
function packageName(specifier: string): string {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]!;
}

const rootManifest: {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
} = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8"));
const rootVersions = { ...rootManifest.devDependencies, ...rootManifest.dependencies };

/** Peer dependencies a package needs installed beside it, such as `@tiptap/pm`. */
async function peersOf(name: string): Promise<string[]> {
  const file = path.join(repoRoot, "node_modules", name, "package.json");
  const manifest: { peerDependencies?: object } = JSON.parse(
    await readFile(file, "utf8").catch(() => {
      console.error(`${name} is not installed, so its peers can't be read. Run: bun install`);
      process.exit(1);
    }),
  );
  return Object.keys(manifest.peerDependencies ?? {}).filter(
    (peer) => peer in rootVersions && !PEERS.has(peer) && !peer.startsWith("@types/react"),
  );
}

/** The imported packages, their peers, and the `@types/*` package each one uses. */
async function withCompanions(names: Iterable<string>): Promise<Set<string>> {
  const all = new Set<string>();
  const queue = [...names];
  while (queue.length > 0) {
    const name = queue.pop()!;
    if (all.has(name)) continue;
    all.add(name);
    queue.push(...(await peersOf(name)));
    const types = `@types/${name.replace(/^@(.+)\/(.+)$/, "$1__$2")}`;
    if (types in rootVersions) queue.push(types);
  }
  return all;
}

interface Manifest {
  dependencies?: Record<string, string>;
  shelfDependencies?: string[];
  [key: string]: unknown;
}

const items = await loadItems();
const owner = new Map<string, Item>();
for (const item of items) for (const file of item.files) owner.set(file, item);

interface Found {
  packages: Set<string>;
  shelf: Set<string>;
  /** import → files, for messages. */
  where: Map<string, string>;
}

async function scan(item: Item): Promise<Found> {
  const found: Found = { packages: new Set(), shelf: new Set(), where: new Map() };
  for (const file of item.files.filter((f) => SCANNED.test(f))) {
    const content = await readFile(file, "utf8");
    const rel = path.relative(repoRoot, file);
    for (const spec of specifiers(content)) {
      if (spec.startsWith(".")) {
        const base = path.resolve(path.dirname(file), spec);
        const target = RESOLVE.map((s) => base + s).find((candidate) => owner.has(candidate));
        const other = target && owner.get(target);
        if (other && other !== item) {
          found.shelf.add(other.name);
          found.where.set(other.name, rel);
        }
      } else if (!spec.startsWith("node:") && !builtinModules.includes(spec)) {
        const name = packageName(spec);
        if (PEERS.has(name)) continue;
        found.packages.add(name);
        for (const implied of IMPLIED[spec] ?? []) found.packages.add(implied);
        found.where.set(name, rel);
      }
    }
  }
  return found;
}

const sorted = (names: Iterable<string>) => [...names].toSorted((a, b) => a.localeCompare(b));
const range = (version: string) => `^${version.replace(/^[\^~]/, "")}`;

let drifted = 0;
const problems: string[] = [];
for (const item of items) {
  const manifestPath = path.join(item.dir, "registry.json");
  const manifest: Manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const found = await scan(item);
  const needed = await withCompanions(found.packages);

  const listedPackages = manifest.dependencies ?? {};
  const listedShelf = manifest.shelfDependencies ?? [];
  const nextPackages: Record<string, string> = {};
  for (const name of sorted(needed)) {
    const version = rootVersions[name];
    if (!version) {
      problems.push(
        `${item.name}: imports "${name}" (${found.where.get(name)}) but the root package.json does not list it. Run: bun add ${name}`,
      );
      continue;
    }
    nextPackages[name] = range(version);
  }
  const nextShelf = sorted(found.shelf);

  const messages: string[] = [];
  for (const name of Object.keys(nextPackages)) {
    if (!(name in listedPackages)) messages.push(`add package ${name}`);
    else if (listedPackages[name] !== nextPackages[name]) {
      messages.push(`${name} ${listedPackages[name]} → ${nextPackages[name]}`);
    }
  }
  for (const name of Object.keys(listedPackages)) {
    if (!(name in nextPackages)) {
      messages.push(`remove unused package ${name}`);
    }
  }
  for (const name of nextShelf) {
    if (!listedShelf.includes(name)) messages.push(`add item ${name} (${found.where.get(name)})`);
  }
  for (const name of listedShelf) {
    if (!found.shelf.has(name)) messages.push(`remove unused item ${name}`);
  }
  if (messages.length === 0) continue;

  drifted++;
  if (flags.fix) {
    manifest.dependencies = nextPackages;
    manifest.shelfDependencies = nextShelf;
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`fixed ${item.path}/registry.json: ${messages.join("; ")}`);
  } else {
    problems.push(`${item.path}/registry.json: ${messages.join("; ")}`);
  }
}

if (flags.fix && drifted > 0) {
  Bun.spawnSync(["bunx", "oxfmt"], { cwd: repoRoot, stdout: "ignore", stderr: "inherit" });
}
if (problems.length > 0) {
  console.error(problems.join("\n"));
  console.error("\nFix with: bun run deps --fix");
  process.exit(1);
}
console.log(drifted > 0 ? `Updated ${drifted} registry.json files.` : "Dependencies are in sync.");
