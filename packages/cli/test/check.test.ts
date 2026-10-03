import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "bun:test";
import { type StepName, check, parseSteps } from "../src/core/check";
import { hashContent } from "../src/core/lock";
import { capture, json, rejection, tempDir, writeTree } from "./helpers";

const ICONS = `export { XIcon as CloseIcon } from "lucide-react";\n`;
const BUTTON = `import * as stylex from "@stylexjs/stylex";
import { CloseIcon } from "./icons";
import { cx } from "@/lib/shelf/cx";

export function Button() {
  return <button className={cx(stylex.props().className)}><CloseIcon /></button>;
}
`;
const CX = `export const cx = (...names: Array<string | undefined>) => names.join(" ");\n`;

function locked(
  files: Record<string, string>,
  dependencies: Record<string, string>,
  shelfDependencies: string[] = [],
) {
  return {
    type: "component",
    registry: "../registry",
    path: "components/x",
    revision: "0".repeat(64),
    installedAt: "2026-01-01T00:00:00.000Z",
    dependencies,
    shelfDependencies,
    files: Object.fromEntries(
      Object.entries(files).map(([target, content]) => [
        target,
        { source: path.basename(target), baseHash: hashContent(content) },
      ]),
    ),
  };
}

/** A consumer with button, icons, and cx installed exactly as Shelf wrote them. */
async function project() {
  const dir = await tempDir("check");
  await writeTree(dir, {
    "package.json": json({
      name: "fixture",
      dependencies: { "@stylexjs/stylex": "^0.19.1", "lucide-react": "^1.0.0" },
    }),
    "shelf.config.json": json({ registry: "../registry", aliases: { "@/*": "src/*" } }),
    "src/components/ui/button.tsx": BUTTON,
    "src/components/ui/icons.tsx": ICONS,
    "src/lib/shelf/cx.ts": CX,
    ".shelf/lock.json": json({
      version: 1,
      items: {
        button: locked(
          { "src/components/ui/button.tsx": BUTTON },
          { "@stylexjs/stylex": "^0.19.1" },
          ["icons", "cx"],
        ),
        cx: locked({ "src/lib/shelf/cx.ts": CX }, {}),
        icons: locked({ "src/components/ui/icons.tsx": ICONS }, { "lucide-react": "^1.0.0" }),
      },
    }),
  });
  return dir;
}

async function run(cwd: string, only?: StepName[]) {
  const out = capture();
  const ok = await check({ cwd, only, verbose: false, out });
  return { ok, text: out.text() };
}

describe("shelf check", () => {
  test("a clean install passes every step", async () => {
    const { ok, text } = await run(await project());
    expect(text).toBe(
      [
        "Shelf check",
        "",
        "✓ config       registry ../registry",
        "✓ provenance   3 items, 3 files",
        "✓ dependencies 2 packages declared, Shelf dependencies installed",
        "✓ imports      2 local imports resolve",
        "",
        "✓ All checks passed (4 passed, 0 skipped)",
      ].join("\n"),
    );
    expect(ok).toBe(true);
  });

  test("the project's own TypeScript, lint, and tests are not Shelf's to run", async () => {
    const dir = await project();
    await writeTree(dir, {
      "tsconfig.json": json({ compilerOptions: { strict: true } }),
      "src/broken.ts": `export const count: number = "one";\n`,
      "src/broken.test.ts": `throw new Error("never run");\n`,
    });
    const { ok } = await run(dir);
    expect(ok).toBe(true);
  });

  test("a project without Shelf fails config with the init command", async () => {
    const { ok, text } = await run(await tempDir("check-empty"));
    expect(ok).toBe(false);
    expect(text).toContain("✗ config       shelf.config.json missing");
    expect(text).toContain("Run: shelf init --registry <path-or-url>");
    expect(text).toContain("- provenance   skipped: no .shelf/lock.json");
    expect(text).toContain("✗ 1 of 4 steps failed: config");
  });

  test("an unreadable lock fails provenance and says why the other lock steps skipped", async () => {
    const dir = await project();
    await writeFile(path.join(dir, ".shelf/lock.json"), "{");
    const { ok, text } = await run(dir);
    expect(ok).toBe(false);
    expect(text).toContain("✗ provenance   lock unreadable");
    expect(text).toContain("- dependencies skipped: .shelf/lock.json is unreadable");
    expect(text).toContain("- imports      skipped: .shelf/lock.json is unreadable");
  });

  test("local modifications are listed and pass", async () => {
    const dir = await project();
    await writeFile(path.join(dir, "src/components/ui/icons.tsx"), `${ICONS}// mine\n`);
    const { ok, text } = await run(dir, ["provenance"]);
    expect(text).toContain(
      "✓ provenance   3 items, 3 files, 1 modified locally\n    ~ src/components/ui/icons.tsx (icons, modified locally)",
    );
    expect(ok).toBe(true);
  });

  test("a deleted installed file names the item to reinstall", async () => {
    const dir = await project();
    await rm(path.join(dir, "src/lib/shelf/cx.ts"));
    const { ok, text } = await run(dir);
    expect(ok).toBe(false);
    expect(text).toContain(
      "src/lib/shelf/cx.ts is recorded in .shelf/lock.json (cx) but missing. Restore it, or run: shelf add cx --overwrite",
    );
    expect(text).toContain(
      `src/components/ui/button.tsx imports "@/lib/shelf/cx", which does not resolve to a file.`,
    );
    expect(text).toContain("✗ 2 of 4 steps failed: provenance, imports");
  });

  test("missing dependencies come with the commands that fix them", async () => {
    const dir = await project();
    await writeTree(dir, { "package.json": json({ name: "fixture" }) });
    const lockPath = path.join(dir, ".shelf/lock.json");
    const lock = await Bun.file(lockPath).json();
    delete lock.items.icons;
    await writeFile(lockPath, JSON.stringify(lock));
    const { ok, text } = await run(dir, ["dependencies"]);
    expect(ok).toBe(false);
    expect(text).toContain(
      [
        "✗ dependencies 2 problems",
        "    button needs icons, which is not installed.",
        "    button needs @stylexjs/stylex@^0.19.1, which is not in package.json.",
        "    Fix: shelf add icons",
        "    Fix: bun add @stylexjs/stylex@^0.19.1",
      ].join("\n"),
    );
  });

  test("a broken relative import in an installed file is reported", async () => {
    const dir = await project();
    await writeFile(
      path.join(dir, "src/components/ui/button.tsx"),
      BUTTON.replace(`"./icons"`, `"./icon"`),
    );
    const { ok, text } = await run(dir, ["imports"]);
    expect(ok).toBe(false);
    expect(text).toContain(
      `✗ imports      1 broken import\n    src/components/ui/button.tsx imports "./icon", which does not resolve to a file.`,
    );
  });

  test("--only rejects unknown steps with the list of valid ones", async () => {
    expect(parseSteps("provenance, imports")).toEqual(["provenance", "imports"]);
    expect(await rejection(Promise.resolve().then(() => parseSteps("typescript")))).toBe(
      'Unknown check step "typescript". Steps: config, provenance, dependencies, imports',
    );
  });
});
