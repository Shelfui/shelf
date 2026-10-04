import { mkdir, readFile, writeFile } from "node:fs/promises";
import { cpus } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import { compareToBaseline, readBaseline, writeBaseline } from "./baseline";
import { compileWithReactCompiler } from "./compiler";
import { scanWithDoctor } from "./doctor";
import { loadItems, repoRoot } from "./items";
import { readStoryFacts } from "./stories";
import type { Size, Verification, VerifyReport } from "./types";

const USAGE = `Usage: bun run verify [--check | --update] [--out <file>]

  (no flag)  Measure every registry item and write dist/verify.json.
  --check    Measure sizes only and fail when an item outgrows scripts/verify/baseline.json.
  --update   Measure everything, rewrite the size baseline, and refresh the copy the website
             reads (apps/web/src/docs/verify.json). Commit both.
  --out      Where to write the report. Default: dist/verify.json.
`;

const { values } = parseArgs({
  options: {
    check: { type: "boolean", default: false },
    update: { type: "boolean", default: false },
    out: { type: "string", default: path.join(repoRoot, "dist", "verify.json") },
    help: { type: "boolean", default: false },
  },
});

if (values.help) {
  process.stdout.write(USAGE);
  process.exit(0);
}

/** The website is built like an outside project, so it reads a committed copy of the report. */
const webCopy = path.join(repoRoot, "apps", "web", "src", "docs", "verify.json");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const isWeight = (value: unknown) =>
  isRecord(value) && typeof value["js"] === "number" && typeof value["css"] === "number";

function isSize(value: unknown): value is Size {
  return isRecord(value) && isWeight(value["own"]) && isWeight(value["total"]);
}

/** Bundles every item in a few worker processes. StyleX keeps global state, so a worker builds one at a time. */
async function measureSizes(names: string[]): Promise<Record<string, Size>> {
  const workers = Math.max(1, Math.min(4, cpus().length - 1));
  const groups = Array.from({ length: workers }, (_, i) =>
    names.filter((_name, j) => j % workers === i),
  );
  const sizes: Record<string, Size> = {};
  await Promise.all(
    groups
      .filter((group) => group.length > 0)
      .map(async (group) => {
        const worker = Bun.spawn(["bun", path.join(import.meta.dirname, "size.ts"), ...group], {
          cwd: repoRoot,
          env: { ...process.env, NODE_ENV: "production" },
          stdout: "pipe",
          stderr: "inherit",
        });
        const output = await new Response(worker.stdout).text();
        if ((await worker.exited) !== 0) throw new Error(`Measuring ${group.join(", ")} failed.`);
        const parsed: unknown = JSON.parse(output);
        if (!isRecord(parsed)) throw new Error("A size worker printed something other than JSON.");
        for (const [name, size] of Object.entries(parsed)) {
          if (isSize(size)) sizes[name] = size;
        }
      }),
  );
  return sizes;
}

/** Items whose size in the website's copy differs from what was just measured. */
async function staleWebCopy(measured: Record<string, Size>): Promise<string[]> {
  const parsed: unknown = JSON.parse(await readFile(webCopy, "utf8").catch(() => "{}"));
  const copied = isRecord(parsed) && isRecord(parsed["items"]) ? parsed["items"] : {};
  const problems: string[] = [];
  for (const [name, size] of Object.entries(measured)) {
    const entry = copied[name];
    const copiedSize = isRecord(entry) ? entry["size"] : undefined;
    if (JSON.stringify(copiedSize) !== JSON.stringify(size)) {
      problems.push(`${name}: apps/web/src/docs/verify.json is out of date`);
    }
  }
  return problems;
}

/**
 * Items whose first load must not contain the heavy libraries. They arrive through `import()`
 * when needed: the rich editor behind the composer and the syntax highlighter behind code.
 * Items that list their lazy files themselves, such as the composer, cannot be checked this way.
 */
const LAZY_ITEMS = ["chat", "code-block"];

async function lazyBoundaryProblems(): Promise<string[]> {
  const worker = Bun.spawn(
    ["bun", path.join(import.meta.dirname, "size.ts"), "--graph", ...LAZY_ITEMS],
    {
      cwd: repoRoot,
      env: { ...process.env, NODE_ENV: "production" },
      stdout: "pipe",
      stderr: "inherit",
    },
  );
  const output = await new Response(worker.stdout).text();
  if ((await worker.exited) !== 0) throw new Error("Reading the import graph failed.");
  const parsed: unknown = JSON.parse(output);
  if (!isRecord(parsed)) throw new Error("The graph worker printed something other than JSON.");

  const problems: string[] = [];
  for (const [name, graph] of Object.entries(parsed)) {
    if (!isRecord(graph) || !Array.isArray(graph["leaks"])) continue;
    const leaks = graph["leaks"].map(String);
    if (leaks.length > 0) {
      problems.push(
        `${name}: loads ${leaks.join(", ")} up front. Import them with import() so they load on demand.`,
      );
    }
  }
  return problems;
}

const items = await loadItems();
const sizes = await measureSizes(items.map((item) => item.name));

if (values.check) {
  const problems = compareToBaseline(sizes, await readBaseline());
  problems.push(...(await staleWebCopy(sizes)));
  problems.push(...(await lazyBoundaryProblems()));
  if (problems.length > 0) {
    process.stderr.write(`Size check failed:\n${problems.map((line) => `  ${line}`).join("\n")}\n`);
    process.stderr.write(
      "\nIf the change is intended, run `bun run verify --update` and commit scripts/verify/baseline.json and apps/web/src/docs/verify.json.\n",
    );
    process.exit(1);
  }
  process.stdout.write(`Sizes are within budget for ${items.length} items.\n`);
  process.exit(0);
}

const boundaryProblems = await lazyBoundaryProblems();
if (boundaryProblems.length > 0) {
  process.stderr.write(
    `Lazy loading check failed:\n${boundaryProblems.map((line) => `  ${line}`).join("\n")}\n`,
  );
  process.exit(1);
}

const doctor = await scanWithDoctor(items);
const report: VerifyReport = { version: 1, items: {} };
for (const item of items) {
  const size = sizes[item.name];
  if (!size) throw new Error(`No size was measured for ${item.name}.`);
  const facts = await readStoryFacts(item);
  const verification: Verification = {
    size,
    packages: item.packages.length,
    shelfDependencies: item.shelfDependencies.length,
    stories: facts.stories,
    storyId: facts.storyId,
    providesContext: facts.providesContext,
    renderTested: facts.renderTested,
    doctor: doctor.get(item.name) ?? { errors: 0, warnings: 0 },
    compiler: await compileWithReactCompiler(item),
  };
  report.items[item.name] = verification;
}

await mkdir(path.dirname(values.out), { recursive: true });
await writeFile(values.out, `${JSON.stringify(report, null, 2)}\n`);
if (values.update) {
  await writeBaseline(sizes);
  await writeFile(webCopy, `${JSON.stringify(report, null, 2)}\n`);
}

const untested = items.filter(
  (item) => report.items[item.name]?.providesContext && !report.items[item.name]?.renderTested,
);
process.stdout.write(`Verified ${items.length} items -> ${path.relative(repoRoot, values.out)}\n`);
if (values.update) {
  process.stdout.write("Rewrote scripts/verify/baseline.json and apps/web/src/docs/verify.json\n");
}
if (untested.length > 0) {
  process.stdout.write(
    `Create a context but have no *.perf.tsx render test: ${untested.map((item) => item.name).join(", ")}\n`,
  );
}
