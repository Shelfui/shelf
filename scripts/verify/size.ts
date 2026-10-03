import stylex from "@stylexjs/unplugin/vite";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { build } from "vite";
import { type Item, isSource, loadItems, repoRoot } from "./items";
import type { Size, Weight } from "./types";

const workDir = path.join(repoRoot, ".tmp", "verify");

/** The StyleX token and condition modules. They must be compiled for any item to get its CSS. */
const STYLEX_MODULE = /\.stylex(?:\.[cm]?[jt]s)?$/;

/**
 * Bundles the item for production and returns the gzipped size of the JavaScript and the
 * StyleX CSS. React is external because every consumer already ships it. With `ownOnly`, only
 * the item's own files and the StyleX token modules are bundled; imports of other Shelf items
 * and packages stay external.
 */
async function bundle(item: Item, ownOnly: boolean): Promise<Weight> {
  const out = path.join(workDir, `${item.name}-${ownOnly ? "own" : "total"}-${process.pid}`);
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });

  // One namespace export per file keeps every export, so this is the item's whole cost.
  const entry = path.join(out, "entry.ts");
  const lines = item.files.flatMap((file, index) => {
    if (file.endsWith(".css")) return [`import ${JSON.stringify(file)};`];
    return isSource(file) ? [`export * as f${index} from ${JSON.stringify(file)};`] : [];
  });
  if (lines.length === 0) return { js: 0, css: 0 };
  await writeFile(entry, `${lines.join("\n")}\n`);

  // The plugin keeps collected rules in a global store that outlives a build.
  Reflect.deleteProperty(globalThis, "__stylex_unplugin_store");

  const isOwn = (id: string, importer: string | undefined) => {
    const resolved = path.isAbsolute(id)
      ? id
      : id.startsWith(".") && importer
        ? path.resolve(path.dirname(importer), id)
        : undefined;
    if (resolved === undefined) return false;
    return (
      resolved === entry || resolved.startsWith(item.dir + path.sep) || STYLEX_MODULE.test(resolved)
    );
  };

  const dist = path.join(out, "dist");
  await build({
    configFile: false,
    logLevel: "silent",
    root: repoRoot,
    // Bun defaults NODE_ENV to development, which would make StyleX inject CSS at runtime.
    plugins: [stylex({ dev: false, runtimeInjection: false, useCSSLayers: true })],
    build: {
      outDir: dist,
      emptyOutDir: true,
      minify: true,
      cssCodeSplit: false,
      rolldownOptions: {
        input: entry,
        // Keep every export, so the entry is not tree-shaken to nothing.
        preserveEntrySignatures: "strict",
        external: (id, importer) =>
          /^react(?:-dom)?(?:\/|$)/.test(id) || (ownOnly && !isOwn(id, importer)),
      },
    },
  });

  const weight: Weight = { js: 0, css: 0 };
  for (const entryName of await readdir(dist, { recursive: true })) {
    const kind = entryName.endsWith(".js") ? "js" : entryName.endsWith(".css") ? "css" : undefined;
    if (!kind) continue;
    weight[kind] += gzipSync(await readFile(path.join(dist, entryName)), { level: 9 }).length;
  }
  await rm(out, { recursive: true, force: true });
  return weight;
}

/** The token CSS is shared by every item, so an item's own CSS leaves it out. The JS tree-shakes per item. */
const withoutTokens = (own: Weight, tokens: Weight): Weight => ({
  js: own.js,
  css: Math.max(0, own.css - tokens.css),
});

/** What the token and condition modules weigh alone, so it can be left out of each item's own size. */
async function tokenWeight(items: Item[]): Promise<Weight> {
  const foundations = items.find((item) => item.type === "foundation");
  if (!foundations) return { js: 0, css: 0 };
  const files = foundations.files.filter((file) =>
    STYLEX_MODULE.test(file.replace(/\.[^.]+$/, "")),
  );
  return bundle({ ...foundations, name: "tokens", files }, true);
}

export async function measureSize(item: Item, tokens: Weight): Promise<Size> {
  const own = await bundle(item, true);
  return {
    own: item.type === "foundation" ? own : withoutTokens(own, tokens),
    total: await bundle(item, false),
  };
}

/** Measures the named items one after another and prints them as JSON, for `measureSizes`. */
async function worker(names: string[]) {
  const all = await loadItems();
  const tokens = await tokenWeight(all);
  const sizes: Record<string, Size> = {};
  for (const item of all.filter((entry) => names.includes(entry.name))) {
    sizes[item.name] = await measureSize(item, tokens);
  }
  process.stdout.write(JSON.stringify(sizes));
}

if (import.meta.main) await worker(process.argv.slice(2));
