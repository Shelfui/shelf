import { existsSync } from "node:fs";
import { cp, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readBase } from "../src/core/base";
import { isObject } from "../src/core/json";
import { serveRegistry } from "../src/serve";
import { CLI_VERSION, REAL_REGISTRY, REPO_ROOT, json, tempDir } from "./helpers";

/**
 * The example consumer, copied outside the repo and stripped of everything
 * `shelf add` produced, then driven through the installed `@shelfui/cli` bin, the
 * way an external project would use it.
 */

const CONSUMER = path.join(REPO_ROOT, "apps/example");
const INSTALLED = [
  "src/components/ui/button.tsx",
  "src/components/ui/dialog.tsx",
  "src/components/ui/icons.tsx",
  "src/lib/shelf/utils.ts",
  "src/styles/shelf/tokens.stylex.ts",
  "src/styles/shelf/conditions.stylex.ts",
  "src/styles/shelf/themes.ts",
  "src/styles/shelf/fonts.css",
];
const TIMEOUT = 180_000;
/** Gzipped bundle sizes, in bytes, for the apps built in the budget test. */
const BUDGETS = path.join(import.meta.dir, "budgets.json");
const BUDGET_SLACK = 0.05;
/** The first path of a few lucide icons, which survives minification. */
const LUCIDE_PATHS = {
  x: "M18 6 6 18",
  chevronDown: "m6 9 6 6 6-6",
  loaderCircle: "M21 12a9 9 0 1 1-6.219-8.56",
  chevronsUpDown: "m7 15 5 5 5-5",
  search: "m21 21-4.34-4.34",
};

let dir: string;
let server: Awaited<ReturnType<typeof serveRegistry>>;

async function exec(command: string[], env: Record<string, string> = {}) {
  const proc = Bun.spawn(command, {
    cwd: dir,
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, NO_COLOR: "1", ...env },
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { stdout, stderr, exitCode, output: `${stdout}\n${stderr}` };
}

const shelf = (...args: string[]) => exec([path.join(dir, "node_modules/.bin/shelf"), ...args]);
const bun = (...args: string[]) => exec([process.execPath, ...args]);
const git = (...args: string[]) =>
  succeed(exec(["git", "-c", "user.name=Shelf", "-c", "user.email=shelf@example.com", ...args]));
const read = (file: string) => readFile(path.join(dir, file), "utf8");
const readJson = async (file: string) => asRecord(JSON.parse(await read(file)));

function asRecord(value: unknown): Record<string, unknown> {
  if (!isObject(value)) throw new Error(`Expected an object, got ${JSON.stringify(value)}`);
  return value;
}

async function succeed(result: Promise<Awaited<ReturnType<typeof exec>>>) {
  const { exitCode, output } = await result;
  if (exitCode !== 0) throw new Error(output);
  return output;
}

/** Lock items without the fields that legitimately differ between installs. */
function comparableItems(lock: unknown) {
  return Object.fromEntries(
    Object.entries(asRecord(asRecord(lock)["items"])).map(([name, item]) => {
      const { installedAt: _at, registry: _registry, ...rest } = asRecord(item);
      return [name, rest];
    }),
  );
}

async function filesUnder(root: string): Promise<string[]> {
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name));
}

/** Builds the consumer and returns its JS, and the gzipped JS and CSS sizes. */
async function bundle() {
  // `bun test` sets NODE_ENV=test, which would make Vite bundle React for development.
  await succeed(exec([process.execPath, "x", "vite", "build"], { NODE_ENV: "production" }));
  const built = await filesUnder(path.join(dir, "dist/assets"));
  const text = async (ext: string) =>
    (await Promise.all(built.filter((f) => f.endsWith(ext)).map((f) => readFile(f, "utf8")))).join(
      "\n",
    );
  const js = await text(".js");
  const css = await text(".css");
  return {
    js,
    sizes: { js: Bun.gzipSync(js).length, css: Bun.gzipSync(css).length },
  };
}

beforeAll(async () => {
  dir = await tempDir("e2e", { outsideRepo: true });
  await cp(CONSUMER, dir, {
    recursive: true,
    filter: (source) => {
      const relative = path.relative(CONSUMER, source);
      return ![
        "node_modules",
        "dist",
        "bun.lock",
        ".shelf",
        "shelf.config.json",
        ...INSTALLED,
      ].includes(relative);
    },
  });
  const pkg = await readJson("package.json");
  const dependencies = asRecord(pkg["dependencies"]);
  const devDependencies = asRecord(pkg["devDependencies"]);
  delete dependencies["@base-ui/react"];
  delete dependencies["@stylexjs/stylex"];
  delete dependencies["@fontsource-variable/geist"];
  delete dependencies["@fontsource-variable/geist-mono"];
  delete dependencies["lucide-react"];
  // Install the CLI the way a registry user gets it: a packed tarball, not a link into this repo.
  const packDir = await tempDir("e2e-pack", { outsideRepo: true });
  const packed = Bun.spawnSync(
    [process.execPath, "pm", "pack", "--quiet", "--destination", packDir],
    { cwd: path.join(REPO_ROOT, "packages/cli") },
  );
  const tarball = packed.stdout.toString().trim().split("\n").at(-1) ?? "";
  if (packed.exitCode !== 0 || !tarball) throw new Error(packed.stderr.toString());
  devDependencies["@shelfui/cli"] = `file:${path.resolve(packDir, tarball)}`;
  await writeFile(path.join(dir, "package.json"), json(pkg));
  await succeed(bun("install"));
  server = await serveRegistry(REAL_REGISTRY);
}, TIMEOUT);

afterAll(() => server?.stop());

describe("external consumer", () => {
  test("the installed CLI is one self-contained Node bundle inside the consumer", async () => {
    const real = await realpath(path.join(dir, "node_modules/@shelfui/cli"));
    expect(real.startsWith(REPO_ROOT)).toBe(false);
    expect(existsSync(path.join(real, "src"))).toBe(false);
    expect(existsSync(path.join(dir, "node_modules/commander"))).toBe(false);
    expect((await read("node_modules/.bin/shelf")).split("\n")[0]).toBe("#!/usr/bin/env node");
    expect((await shelf("--version")).stdout).toBe(`${CLI_VERSION}\n`);
  });

  test("starts without any Shelf source", async () => {
    for (const file of INSTALLED) expect(await Bun.file(path.join(dir, file)).exists()).toBe(false);
    const { exitCode, output } = await bun("x", "tsc", "--noEmit");
    expect(exitCode).not.toBe(0);
    expect(output).toContain("Cannot find module './components/ui/button'");
  });

  test(
    "init, add button, and add dialog install normal source, packages, and provenance",
    async () => {
      await succeed(shelf("init", "--registry", REAL_REGISTRY));
      const output = await succeed(shelf("add", "button"));
      expect(output).toContain(
        "✓ installed @base-ui/react@^1.8.0, @fontsource-variable/geist-mono@^5.3.0, @fontsource-variable/geist@^5.3.0, @stylexjs/stylex@^0.19.1",
      );
      expect(output).toContain("✓ recorded provenance in .shelf/lock.json");

      const pkg = await readJson("package.json");
      expect(pkg["dependencies"]).toMatchObject({
        "@base-ui/react": "^1.8.0",
        "@stylexjs/stylex": "^0.19.1",
      });

      const dialog = await succeed(shelf("add", "dialog"));
      expect(dialog).toContain("✓ kept your installed button, Shelf has no newer version");
      expect(await read("src/components/ui/dialog.tsx")).toContain(`from "./button"`);

      // Identical to the committed consumer's BASE, which is what the registry served.
      const committedLock = JSON.parse(
        await readFile(path.join(CONSUMER, ".shelf/lock.json"), "utf8"),
      );
      expect(comparableItems(await readJson(".shelf/lock.json"))).toEqual(
        comparableItems(committedLock),
      );
      for (const name of Object.keys(asRecord(committedLock.items))) {
        for (const [target, content] of await readBase(CONSUMER, name)) {
          expect(await read(target)).toBe(content);
        }
      }
      expect(existsSync(path.join(dir, ".shelf/base"))).toBe(false);
      expect(await read("src/styles/shelf/tokens.stylex.ts")).toBe(
        await readFile(path.join(REAL_REGISTRY, "foundations/tokens.stylex.ts"), "utf8"),
      );
      expect(await read("src/components/ui/button.tsx")).toContain(
        `from "../../styles/shelf/tokens.stylex"`,
      );

      expect(await succeed(shelf("add", "button", "dialog"))).toContain("Nothing changed.");
    },
    TIMEOUT,
  );

  test(
    "an HTTP registry installs byte-identical files and provenance",
    async () => {
      const lockBefore = comparableItems(await readJson(".shelf/lock.json"));
      const filesBefore = await Promise.all(INSTALLED.map(read));
      const config = await read("shelf.config.json");

      await rm(path.join(dir, ".shelf"), { recursive: true });
      for (const file of INSTALLED) await rm(path.join(dir, file));
      await writeFile(
        path.join(dir, "shelf.config.json"),
        json({ ...JSON.parse(config), registry: server.url.toString() }),
      );
      await succeed(shelf("add", "button", "dialog"));

      expect(await Promise.all(INSTALLED.map(read))).toEqual(filesBefore);
      expect(comparableItems(await readJson(".shelf/lock.json"))).toEqual(lockBefore);
      await writeFile(path.join(dir, "shelf.config.json"), config);
    },
    TIMEOUT,
  );

  test(
    "the committed local modification is owned and passes shelf check",
    async () => {
      for (const file of ["src/components/ui/button.tsx", "src/components/ui/dialog.tsx"]) {
        await cp(path.join(CONSUMER, file), path.join(dir, file));
      }
      const { exitCode, stdout } = await shelf("check");
      expect(stdout).toContain("~ src/components/ui/button.tsx (button, modified locally)");
      expect(stdout).toContain("~ src/components/ui/dialog.tsx (dialog, modified locally)");
      expect(stdout).toContain("✓ All checks passed");
      expect(exitCode).toBe(0);

      const mine = await read("src/components/ui/button.tsx");
      const again = await succeed(shelf("add", "button"));
      expect(again).toContain(
        "✓ kept your modified src/components/ui/button.tsx, Shelf's version has not changed",
      );
      expect(await read("src/components/ui/button.tsx")).toBe(mine);
    },
    TIMEOUT,
  );

  test(
    "shelf update merges a registry change into the locally modified button",
    async () => {
      const registry = await tempDir("e2e-registry-v2", { outsideRepo: true });
      await cp(REAL_REGISTRY, registry, { recursive: true });
      const source = path.join(registry, "components/button/button.tsx");
      const original = await readFile(source, "utf8");
      expect(original).toContain("borderRadius: radius.md,");
      await writeFile(
        source,
        original.replace("borderRadius: radius.md,", "borderRadius: radius.lg,"),
      );

      const config = await read("shelf.config.json");
      const lock = await read(".shelf/lock.json");
      const button = await read("src/components/ui/button.tsx");
      const base = new Map(await readBase(CONSUMER, "button")).get("src/components/ui/button.tsx");
      if (base === undefined) throw new Error("no BASE for the example button");
      await writeFile(path.join(dir, "src/components/ui/button.tsx"), base);
      await git("init", "--quiet");
      await git("add", "src/components/ui/button.tsx");
      await git("commit", "--quiet", "-m", "shelf add button");
      await writeFile(path.join(dir, "src/components/ui/button.tsx"), button);
      await writeFile(
        path.join(dir, "shelf.config.json"),
        json({ ...JSON.parse(config), registry }),
      );
      try {
        expect(await succeed(shelf("status", "button"))).toContain(
          "button  modified locally, update available",
        );
        const updated = await succeed(shelf("update"));
        expect(updated).toContain(
          "✓ merged Shelf's changes into your modified src/components/ui/button.tsx",
        );
        const merged = await read("src/components/ui/button.tsx");
        expect(merged).toContain("borderRadius: radius.lg,");
        expect(merged).toContain(`| "xl";`);
        const { exitCode, stdout } = await shelf("check");
        expect(stdout).toContain("~ src/components/ui/button.tsx (button, modified locally)");
        expect(exitCode).toBe(0);
        await succeed(bun("x", "tsc", "--noEmit"));
      } finally {
        await writeFile(path.join(dir, "shelf.config.json"), config);
        await writeFile(path.join(dir, ".shelf/lock.json"), lock);
        await writeFile(path.join(dir, "src/components/ui/button.tsx"), button);
        await rm(path.join(dir, ".git"), { recursive: true, force: true });
      }
    },
    TIMEOUT,
  );

  test(
    "a local modification that breaks an import fails shelf check with the location",
    async () => {
      const file = path.join(dir, "src/components/ui/button.tsx");
      const original = await readFile(file, "utf8");
      await writeFile(file, `${original}\nexport { Missing } from "./missing";\n`);
      try {
        const { exitCode, stdout } = await shelf("check");
        expect(exitCode).toBe(1);
        expect(stdout).toContain(
          `✗ imports      1 broken import\n    src/components/ui/button.tsx imports "./missing", which does not resolve to a file.`,
        );
      } finally {
        await writeFile(file, original);
      }
    },
    TIMEOUT,
  );

  test(
    "the build extracts StyleX statically and resolves nothing from the Shelf repo",
    async () => {
      await succeed(
        exec([process.execPath, "x", "vite", "build", "--sourcemap"], { NODE_ENV: "production" }),
      );
      const built = await filesUnder(path.join(dir, "dist/assets"));
      const css = await Promise.all(
        built.filter((f) => f.endsWith(".css")).map((f) => readFile(f, "utf8")),
      );
      const js = await Promise.all(
        built.filter((f) => f.endsWith(".js")).map((f) => readFile(f, "utf8")),
      );
      // `primary` and the typeface from the installed foundations, and the consumer's own `xl`
      // button size and narrower dialog.
      expect(css.join("")).toContain("#171717");
      expect(css.join("")).toContain("Geist Variable");
      expect(built.some((file) => /geist-latin-wght-normal.*\.woff2$/.test(file))).toBe(true);
      expect(css.join("")).toMatch(/height:\s*2\.5rem/);
      expect(css.join("")).toMatch(/max-width:\s*26rem/);
      expect(js.join("")).not.toMatch(/defineVars|stylex\.create/);

      const sources: string[] = [];
      for (const map of built.filter((f) => f.endsWith(".map"))) {
        const mapSources = asRecord(JSON.parse(await readFile(map, "utf8")))["sources"];
        if (!Array.isArray(mapSources)) throw new Error(`${map} has no sources`);
        for (const source of mapSources) {
          sources.push(path.resolve(path.dirname(map), String(source)));
        }
      }
      expect(sources).toContain(path.join(dir, "src/components/ui/button.tsx"));
      expect(sources.filter((source) => source.startsWith(REPO_ROOT))).toEqual([]);
    },
    TIMEOUT,
  );

  test(
    "bundles tree-shake unused components and icons and stay within budget",
    async () => {
      const app = await read("src/App.tsx");
      await writeFile(
        path.join(dir, "src/App.tsx"),
        `import { Button } from "./components/ui/button";\n\nexport function App() {\n  return <Button>Save</Button>;\n}\n`,
      );
      const buttonOnly = await bundle();
      await writeFile(path.join(dir, "src/App.tsx"), app);
      const withDialog = await bundle();

      expect(buttonOnly.js).not.toContain("dialog-content");
      expect(buttonOnly.js).not.toContain(LUCIDE_PATHS.x);
      expect(withDialog.js).toContain("dialog-content");
      // Dialog uses one icon (X). Its path ships; the rest of icons.tsx and lucide don't.
      expect(withDialog.js).toContain(LUCIDE_PATHS.x);
      for (const [name, d] of Object.entries(LUCIDE_PATHS).filter(([key]) => key !== "x")) {
        expect(withDialog.js.includes(d), `the unused ${name} icon was bundled`).toBe(false);
      }

      const measured = { button: buttonOnly.sizes, "button+dialog": withDialog.sizes };
      const budgets: unknown = JSON.parse(await readFile(BUDGETS, "utf8"));
      for (const [name, sizes] of Object.entries(measured)) {
        const budget = asRecord(asRecord(budgets)[name]);
        for (const kind of ["js", "css"] as const) {
          const limit = Math.round(Number(budget[kind]) * (1 + BUDGET_SLACK));
          expect(
            sizes[kind],
            `${name} ${kind} is ${sizes[kind]} B gzipped, over its ${String(budget[kind])} B budget (+${BUDGET_SLACK * 100}%). If the growth is intended, update ${path.relative(REPO_ROOT, BUDGETS)}. Measured: ${JSON.stringify(measured)}`,
          ).toBeLessThanOrEqual(limit);
        }
      }
    },
    TIMEOUT,
  );

  test(
    "swapping an icon in icons.tsx is a local change every component follows",
    async () => {
      const file = path.join(dir, "src/components/ui/icons.tsx");
      const original = await readFile(file, "utf8");
      const custom = `function X(props: IconProps) {\n  return (\n    <svg viewBox="0 0 24 24" {...props}>\n      <path d="M4 4 20 20" />\n    </svg>\n  );\n}\n`;
      await writeFile(file, `${original.replace("  XIcon as X,\n", "")}\n${custom}`);
      try {
        const { exitCode, stdout } = await shelf("check");
        expect(stdout).toContain("~ src/components/ui/icons.tsx (icons, modified locally)");
        expect(exitCode).toBe(0);

        const { js } = await bundle();
        expect(js).toContain("M4 4 20 20");
        expect(js).not.toContain(LUCIDE_PATHS.x);
      } finally {
        await writeFile(file, original);
      }
    },
    TIMEOUT,
  );

  test(
    "every registry item installs, compiles, and passes shelf check",
    async () => {
      const items = asRecord(
        JSON.parse(await readFile(path.join(REAL_REGISTRY, "index.json"), "utf8")),
      )["items"];
      if (!Array.isArray(items)) throw new Error("index.json has no items");
      const entries = items.map((item: unknown) => ({
        name: String(asRecord(item)["name"]),
        type: String(asRecord(item)["type"]),
      }));
      const names = entries.map((entry) => entry.name);
      const app = await read("src/App.tsx");
      const modified = ["src/components/ui/button.tsx", "src/components/ui/dialog.tsx"];
      await succeed(shelf("add", ...names, "--overwrite"));
      const components = entries.filter(
        (entry) => entry.type === "component" || entry.type === "block",
      );
      const imports = components.map(
        ({ name, type }, i) =>
          `import * as C${i} from "./components/${type === "block" ? "blocks" : "ui"}/${name}";`,
      );
      await writeFile(
        path.join(dir, "src/App.tsx"),
        `${imports.join("\n")}\n\nconst all = [${components.map((_, i) => `C${i}`).join(", ")}];\n\nexport function App() {\n  return <pre>{all.length}</pre>;\n}\n`,
      );
      await succeed(bun("x", "oxfmt", "src/App.tsx"));
      try {
        const { exitCode, stdout } = await shelf("check");
        if (exitCode !== 0) throw new Error(stdout);
        expect(stdout).toContain(`✓ provenance   ${names.length} items`);
        await succeed(bun("x", "tsc", "--noEmit"));
        const { js } = await bundle();
        expect(js).toContain("navigation-menu-popup");
        expect(js).toContain("toast");
      } finally {
        await writeFile(path.join(dir, "src/App.tsx"), app);
        for (const file of modified) await cp(path.join(CONSUMER, file), path.join(dir, file));
      }
    },
    TIMEOUT,
  );

  test(
    "removing Shelf tooling leaves a working app",
    async () => {
      await rm(path.join(dir, ".shelf"), { recursive: true });
      await rm(path.join(dir, "shelf.config.json"));
      await succeed(bun("remove", "@shelfui/cli"));
      expect(await Bun.file(path.join(dir, "node_modules/.bin/shelf")).exists()).toBe(false);
      await succeed(bun("x", "tsc", "--noEmit"));
      await succeed(bun("x", "vite", "build"));
    },
    TIMEOUT,
  );
});
