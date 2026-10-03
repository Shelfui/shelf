import { existsSync } from "node:fs";
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "bun:test";
import { add } from "../src/core/add";
import { readBase } from "../src/core/base";
import { check } from "../src/core/check";
import { LEGACY_BASE_DIR, LOCK_FILE, hashContent, readLock } from "../src/core/lock";
import { loadIndex, openRegistry } from "../src/core/registry";
import { resolveItems } from "../src/core/resolve";
import {
  capture,
  fixtureConsumer,
  fixtureRegistryDir,
  json,
  rejection,
  runCli,
  tempDir,
  writeTree,
} from "./helpers";

const BUTTON = "src/components/ui/button.tsx";
const TOKENS = "src/styles/shelf/tokens.stylex.ts";

async function setup() {
  const registry = await fixtureRegistryDir();
  const cwd = await fixtureConsumer(registry);
  return { registry, cwd };
}

async function addButton(cwd: string, overwrite = false) {
  const out = capture();
  await add({ cwd, names: ["button"], overwrite, install: false, out });
  return out;
}

async function provenance(cwd: string) {
  const out = capture();
  const ok = await check({ cwd, only: ["provenance"], verbose: false, out });
  return { ok, text: out.text() };
}

describe("shelf add provenance", () => {
  test("records a hash of every installed file and copies nothing else", async () => {
    const { registry, cwd } = await setup();
    const out = await addButton(cwd);
    expect(out.text()).toContain("Button and Tokens are now yours.");

    const lock = await readLock(cwd);
    expect(Object.keys(lock.items).toSorted()).toEqual(["button", "tokens"]);

    const items = await resolveItems(
      openRegistry(registry),
      await loadIndex(openRegistry(registry)),
      ["button"],
    );
    for (const item of items) {
      const locked = lock.items[item.name]!;
      expect(locked.revision).toBe(item.revision);
      expect(locked.registry).toBe(registry);
      expect(locked.dependencies).toEqual(item.dependencies);
      for (const [target, file] of Object.entries(locked.files)) {
        const installed = await readFile(path.join(cwd, target));
        expect(hashContent(installed)).toBe(file.baseHash);
      }
    }
    expect(existsSync(path.join(cwd, LEGACY_BASE_DIR))).toBe(false);
    expect(lock.items["button"]?.files[BUTTON]?.source).toBe("button.tsx");
    expect(await readFile(path.join(cwd, BUTTON), "utf8")).toContain(
      `from "../../styles/shelf/tokens.stylex"`,
    );
  });

  test("the lock is stable: sorted keys, and a re-run changes nothing", async () => {
    const { cwd } = await setup();
    await addButton(cwd);
    const first = await readFile(path.join(cwd, LOCK_FILE), "utf8");
    const parsed = JSON.parse(first);
    expect(Object.keys(parsed)).toEqual(["items", "version"]);
    expect(Object.keys(parsed.items.button)).toEqual(Object.keys(parsed.items.button).toSorted());

    const again = await addButton(cwd);
    expect(again.text()).toContain("Nothing changed.");
    expect(await readFile(path.join(cwd, LOCK_FILE), "utf8")).toBe(first);
  });

  test("keeps a locally modified file when Shelf's version has not changed", async () => {
    const { cwd } = await setup();
    await addButton(cwd);
    const lockBefore = await readFile(path.join(cwd, LOCK_FILE), "utf8");
    await writeFile(path.join(cwd, BUTTON), "// mine\n");

    const out = await addButton(cwd);
    expect(out.text()).toContain(
      `✓ kept your modified ${BUTTON}, Shelf's version has not changed\n\nNothing changed.`,
    );
    expect(await readFile(path.join(cwd, BUTTON), "utf8")).toBe("// mine\n");
    expect(await readFile(path.join(cwd, LOCK_FILE), "utf8")).toBe(lockBefore);
  });

  test("removes a legacy .shelf/base folder", async () => {
    const { cwd } = await setup();
    await addButton(cwd);
    await writeTree(cwd, { [`${LEGACY_BASE_DIR}/button/button.tsx`]: "// old copy\n" });

    const out = await addButton(cwd);
    expect(out.text()).toContain(`✓ removed ${LEGACY_BASE_DIR}/`);
    expect(existsSync(path.join(cwd, LEGACY_BASE_DIR))).toBe(false);
  });

  test("--overwrite replaces the modified file and keeps BASE consistent", async () => {
    const { cwd } = await setup();
    await addButton(cwd);
    const original = await readFile(path.join(cwd, BUTTON), "utf8");
    await writeFile(path.join(cwd, BUTTON), "// mine\n");

    const out = await addButton(cwd, true);
    expect(out.text()).toContain("✓ replaced 1 locally modified file");
    expect(await readFile(path.join(cwd, BUTTON), "utf8")).toBe(original);
    expect((await provenance(cwd)).ok).toBe(true);
  });

  test("an unmanaged file at a target path is never silently replaced", async () => {
    const registry = await fixtureRegistryDir();
    const cwd = await fixtureConsumer(registry, { [BUTTON]: "export const Mine = 1;\n" });
    expect(await rejection(addButton(cwd))).toContain(
      `${BUTTON} (button: exists and was not installed by Shelf)`,
    );
    expect(existsSync(path.join(cwd, LOCK_FILE))).toBe(false);
    expect(existsSync(path.join(cwd, TOKENS))).toBe(false);
  });

  test("an upstream change updates unmodified files and moves BASE forward", async () => {
    const { registry, cwd } = await setup();
    await addButton(cwd);
    const before = (await readLock(cwd)).items["button"]!;

    await writeFile(
      path.join(registry, "components/button/button.tsx"),
      `import { colors } from "../../foundations/tokens.stylex";\nexport const Button = () => [colors.text, "v2"];\n`,
    );
    const out = await addButton(cwd);
    expect(out.text()).toContain("✓ updated 1 file");

    const after = (await readLock(cwd)).items["button"]!;
    expect(after.revision).not.toBe(before.revision);
    expect(after.files[BUTTON]?.baseHash).not.toBe(before.files[BUTTON]?.baseHash);
    expect((await readBase(cwd, "button")).get(BUTTON)).toContain('"v2"');
    expect((await provenance(cwd)).ok).toBe(true);
  });

  test("a file dropped upstream loses its BASE but stays in the project", async () => {
    const { registry, cwd } = await setup();
    const manifestPath = path.join(registry, "components/button/registry.json");
    const manifest = await readFile(manifestPath, "utf8");
    const withExtra = JSON.parse(manifest);
    withExtra.files.push({ path: "extra.ts" });
    const EXTRA = "src/components/ui/extra.ts";

    await writeFile(path.join(registry, "components/button/extra.ts"), "export {};\n");
    await writeFile(manifestPath, json(withExtra));
    await addButton(cwd);

    await writeFile(manifestPath, manifest);
    const out = await addButton(cwd);

    expect(out.text()).toContain(`! No longer part of Shelf's version, kept as your own`);
    expect(out.text()).toContain(`  ${EXTRA}`);
    expect(existsSync(path.join(cwd, EXTRA))).toBe(true);
    expect(Object.keys((await readLock(cwd)).items["button"]!.files)).toEqual([BUTTON]);
    expect((await provenance(cwd)).ok).toBe(true);
  });

  test("adding an item keeps its installed, locally modified dependencies", async () => {
    const { registry, cwd } = await setup();
    await addButton(cwd);
    const mine = `import { colors } from "../../styles/shelf/tokens.stylex";\nexport const Button = () => ["mine", colors];\n`;
    await writeFile(path.join(cwd, BUTTON), mine);
    await writeFile(path.join(registry, "components/button/button.tsx"), "// upstream v2\n");
    const lockBefore = (await readLock(cwd)).items["button"];

    const out = capture();
    await add({ cwd, names: ["card"], overwrite: false, install: false, out });

    expect(out.text()).toContain(
      "! kept your installed button, but Shelf has a newer version that card may need (update it with: shelf add button)",
    );
    expect(out.text()).toContain("✓ kept your installed tokens, Shelf has no newer version");
    expect(await readFile(path.join(cwd, BUTTON), "utf8")).toBe(mine);
    expect((await readLock(cwd)).items["button"]).toEqual(lockBefore);
    expect(await readFile(path.join(cwd, "src/components/ui/card.tsx"), "utf8")).toContain(
      `from "./button"`,
    );
    expect((await provenance(cwd)).text).toContain(`~ ${BUTTON} (button, modified locally)`);
  });

  test("an upstream change on a local modification without a recoverable BASE is refused", async () => {
    const { registry, cwd } = await setup();
    await addButton(cwd);
    const lockBefore = await readFile(path.join(cwd, LOCK_FILE), "utf8");
    await writeFile(path.join(cwd, BUTTON), "// mine\n");
    await writeFile(path.join(registry, "components/button/button.tsx"), "// upstream v2\n");

    const message = await rejection(addButton(cwd));
    expect(message).toContain(
      `Refusing to overwrite 1 file:\n  ${BUTTON} (button: modified locally, and its BASE can't be recovered to merge)\nCan't recover BASE for 1 file of button`,
    );
    expect(message).toContain("Nothing was changed.");
    expect(await readFile(path.join(cwd, BUTTON), "utf8")).toBe("// mine\n");
    expect(await readFile(path.join(cwd, LOCK_FILE), "utf8")).toBe(lockBefore);
  });

  test.each([
    ["CRLF line endings", (s: string) => s.replaceAll("\n", "\r\n")],
    ["a UTF-8 BOM", (s: string) => `\uFEFF${s}`],
    ["a trailing newline removed", (s: string) => s.trimEnd()],
  ])("%s count as a local modification", async (_, mutate) => {
    const { cwd } = await setup();
    await addButton(cwd);
    const file = path.join(cwd, BUTTON);
    await writeFile(file, mutate(await readFile(file, "utf8")));
    const result = await provenance(cwd);
    expect(result.ok).toBe(true);
    expect(result.text).toContain(`~ ${BUTTON} (button, modified locally)`);
    expect((await addButton(cwd)).text()).toContain(`✓ kept your modified ${BUTTON}`);
  });

  test("a failed package install leaves the project untouched", async () => {
    const registry = await fixtureRegistryDir({
      "components/button/registry.json": json({
        name: "button",
        type: "component",
        description: "A button.",
        files: [{ path: "button.tsx" }],
        dependencies: { "shelf-test-package-that-does-not-exist-9f2c": "1.0.0" },
        shelfDependencies: ["tokens"],
      }),
    });
    const cwd = await tempDir("consumer-install", { outsideRepo: true });
    await writeTree(cwd, {
      "package.json": json({
        name: "consumer",
        private: true,
        dependencies: { "@stylexjs/stylex": "0.19.1" },
      }),
      "shelf.config.json": json({ registry }),
    });
    expect(
      await rejection(
        add({ cwd, names: ["button"], overwrite: false, install: true, out: capture() }),
      ),
    ).toContain(
      "bun add shelf-test-package-that-does-not-exist-9f2c@1.0.0 failed (exit 1). No files were written.",
    );
    expect(existsSync(path.join(cwd, BUTTON))).toBe(false);
    expect(existsSync(path.join(cwd, TOKENS))).toBe(false);
    expect(existsSync(path.join(cwd, ".shelf"))).toBe(false);
  }, 60_000);
});

describe("shelf check provenance", () => {
  test("reports locally modified files as information, not failure", async () => {
    const { cwd } = await setup();
    await addButton(cwd);
    await writeFile(path.join(cwd, BUTTON), "// mine\n");
    const result = await provenance(cwd);
    expect(result.ok).toBe(true);
    expect(result.text).toContain("✓ provenance   2 items, 2 files, 1 modified locally");
  });

  test("a deleted installed file fails with a fix", async () => {
    const { cwd } = await setup();
    await addButton(cwd);
    await rm(path.join(cwd, BUTTON));
    const result = await provenance(cwd);
    expect(result.ok).toBe(false);
    expect(result.text).toContain(
      `${BUTTON} is recorded in ${LOCK_FILE} (button) but missing. Restore it, or run: shelf add button --overwrite`,
    );
  });

  test.each([
    ["corrupt JSON", "{ not json", "is not valid JSON"],
    [
      "wrong version",
      json({ version: 2, items: {} }),
      'expected { "version": 1, "items": { ... } }',
    ],
    [
      "malformed hash",
      json({
        version: 1,
        items: {
          button: {
            type: "component",
            registry: "r",
            path: "p",
            revision: "0".repeat(64),
            installedAt: "t",
            files: { [BUTTON]: { source: "button.tsx", baseHash: "abc" } },
          },
        },
      }),
      "has a malformed baseHash",
    ],
    [
      "traversal in a lock path",
      json({
        version: 1,
        items: {
          button: {
            type: "component",
            registry: "r",
            path: "p",
            revision: "0".repeat(64),
            installedAt: "t",
            files: { "../../etc/passwd": { source: "button.tsx", baseHash: "0".repeat(64) } },
          },
        },
      }),
      'file path "../../etc/passwd" is not allowed',
    ],
    [
      "a revision that is not a hash",
      json({
        version: 1,
        items: {
          button: {
            type: "component",
            registry: "r",
            path: "p",
            revision: "../../secret",
            installedAt: "t",
            files: {},
          },
        },
      }),
      'item "button" has a malformed revision',
    ],
    [
      "a dependency range that is not a string",
      json({
        version: 1,
        items: {
          button: {
            type: "component",
            registry: "r",
            path: "p",
            revision: "0".repeat(64),
            installedAt: "t",
            dependencies: { react: 19 },
            files: {},
          },
        },
      }),
      'item "button" has malformed "dependencies"',
    ],
  ])("a lock with %s fails with a specific message", async (_, content, message) => {
    const { cwd } = await setup();
    await writeTree(cwd, { [LOCK_FILE]: content });
    const result = await provenance(cwd);
    expect(result.ok).toBe(false);
    expect(result.text).toContain(message);
    expect(await rejection(addButton(cwd))).toContain(message);
  });
});

describe("CLI process behavior", () => {
  test("errors go to stderr with a non-zero exit code", async () => {
    const { cwd } = await setup();
    const result = await runCli(["add", "buton"], cwd);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe('✗ Unknown Shelf item "buton". Did you mean "button"?\n');
  });

  test("add without shelf.config.json points at init", async () => {
    const cwd = await tempDir("bare");
    await writeTree(cwd, { "package.json": json({ name: "bare" }) });
    const result = await runCli(["add", "button"], cwd);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("No shelf.config.json in");
    expect(result.stderr).toContain("Run: shelf init --registry <path-or-url>");
  });

  test("init is idempotent and requires a registry", async () => {
    const registry = await fixtureRegistryDir();
    const cwd = await tempDir("init");
    await writeTree(cwd, { "package.json": json({ name: "app" }) });

    const missing = await runCli(["init"], cwd, { SHELF_REGISTRY: "" });
    expect(missing.exitCode).toBe(1);
    expect(missing.stderr).toContain("No registry given. Run: shelf init --registry <path-or-url>");

    const first = await runCli(["init", "--registry", registry], cwd);
    expect(first.exitCode).toBe(0);
    expect(first.stdout).toContain(`✓ created shelf.config.json (registry: ${registry}, 3 items)`);
    expect(first.stdout).toContain("✓ created .shelf/lock.json");
    expect(first.stdout).toContain(
      "! StyleX build plugin missing. Run: bun add -d @stylexjs/unplugin",
    );
    const config = await readFile(path.join(cwd, "shelf.config.json"), "utf8");
    expect(JSON.parse(config).$schema).toBe("./node_modules/@shelfui/cli/schema.json");

    const second = await runCli(["init", "--registry", "/elsewhere"], cwd);
    expect(second.exitCode).toBe(0);
    expect(second.stdout).toContain("✓ shelf.config.json already exists");
    expect(await readFile(path.join(cwd, "shelf.config.json"), "utf8")).toBe(config);
  });

  test("init checks a Next.js app for the Babel and PostCSS StyleX setup", async () => {
    const registry = await fixtureRegistryDir();
    const cwd = await tempDir("init-next");
    await writeTree(cwd, {
      "package.json": json({
        name: "app",
        dependencies: { next: "16.3.5" },
        devDependencies: { "@stylexjs/babel-plugin": "0.19.1" },
      }),
      "babel.config.js": "module.exports = {};\n",
    });

    const result = await runCli(["init", "--registry", registry], cwd);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      "! StyleX @stylexjs/postcss-plugin missing. Run: bun add -d @stylexjs/postcss-plugin",
    );
    expect(result.stdout).toContain(
      "! No postcss.config.js found. @stylexjs/postcss-plugin writes the CSS.",
    );
    expect(result.stdout).not.toContain("babel-plugin missing");
    expect(result.stdout).not.toContain("unplugin");
  });

  test("search filters by every term", async () => {
    const { cwd } = await setup();
    const result = await runCli(["search", "card", "surface"], cwd);
    expect(result.stdout).toBe("card  component   A card surface.\n");
    const none = await runCli(["search", "nothing-matches"], cwd);
    expect(none.stdout).toBe('No Shelf items match "nothing-matches".\n');
  });

  test("unknown flags and commands are rejected", async () => {
    const { cwd } = await setup();
    const flag = await runCli(["add", "button", "--force"], cwd);
    expect(flag.exitCode).toBe(1);
    expect(flag.stderr).toBe("✗ Unknown option '--force'\n  Run: shelf add --help\n");
    const command = await runCli(["frobnicate", "button"], cwd);
    expect(command.exitCode).toBe(1);
    expect(command.stderr).toBe("✗ Unknown command 'frobnicate'\n  Run: shelf --help\n");
    const typo = await runCli(["serv"], cwd);
    expect(typo.stderr).toBe(
      "✗ Unknown command 'serv'. Did you mean serve?\n  Run: shelf --help\n",
    );
  });
});
