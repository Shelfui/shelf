import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "bun:test";
import { handleError } from "../src/cli/errors";
import { run } from "../src/cli/program";
import { ShelfError } from "../src/core/errors";
import { fixtureConsumer, fixtureRegistryDir, json, runCli, tempDir, writeTree } from "./helpers";

async function shelf(...args: string[]) {
  let stdout = "";
  let stderr = "";
  const exitCode = await run(args, {
    stdout: (text) => (stdout += text),
    stderr: (text) => (stderr += text),
  });
  return { exitCode, stdout, stderr };
}

const ROOT_HELP = `Usage: shelf [options] [command]

Shelf: take what you need, own the source.

Options:
  -v, --version                print the Shelf CLI version
  --cwd <dir>                  run as if started in <dir>
  -h, --help                   show help

Commands:
  init [options]               Create shelf.config.json and .shelf/
  search [options] [query...]  List registry items matching every term
  add [options] <items...>     Copy items into your project and record provenance
  status [options] [items...]  Show which installed items you changed and which Shelf has updated
  diff [options] <item>        Show Shelf's changes to an item since you installed it
  update [options] [items...]  Update installed items, merging Shelf's changes into yours
  check [options]              Validate installed Shelf items (exit 1 on failure)
  docs [options] [topic]       Print documentation for a topic or an item, as Markdown
  usage [options] [dirs...]    Show where installed Shelf items are used, across projects and repos
  build [options] [dir]        Validate a registry and write the files that install, for static
                               hosting
  serve [options] [dir]        Serve a registry directory over HTTP on 127.0.0.1 (until stopped)

Examples:
  shelf init --registry ./registry
  shelf add button
  shelf status
  shelf docs button
  shelf update
  shelf check --only provenance,imports
  shelf usage apps --registry ./registry
  shelf build registry --out dist/registry
`;

describe("shelf CLI", () => {
  test("--help and a bare invocation print the same help to stdout", async () => {
    for (const args of [["--help"], ["-h"], []]) {
      const result = await shelf(...args);
      expect(result).toEqual({ exitCode: 0, stdout: ROOT_HELP, stderr: "" });
    }
  });

  test("every command documents its arguments, options, and the global --cwd", async () => {
    const expected: Record<string, string[]> = {
      init: ["Usage: shelf init [options]", "--registry <location>"],
      search: ["Usage: shelf search [options] [query...]", "--registry <location>"],
      add: [
        "Usage: shelf add [options] <items...>",
        "--overwrite",
        "--skip-install",
        "do not install missing packages",
      ],
      check: [
        "Usage: shelf check [options]",
        "--only <steps>",
        "--verbose",
        "Steps: config, provenance,",
      ],
      usage: ["Usage: shelf usage [options] [dirs...]", "--repo <url>", "--registry", "--json"],
      build: ["Usage: shelf build [options] [dir]", "--out <dir>", '(default: "dist/registry")'],
      serve: ["Usage: shelf serve [options] [dir]", "--port <port>", "(default: 4400)"],
    };
    for (const [command, lines] of Object.entries(expected)) {
      const result = await shelf(command, "--help");
      expect(result.exitCode).toBe(0);
      expect(result.stderr).toBe("");
      for (const line of [...lines, "Global Options:", "--cwd <dir>"]) {
        expect(result.stdout).toContain(line);
      }
    }
  });

  test("--version prints the package version", async () => {
    const pkg: unknown = JSON.parse(
      await readFile(path.join(import.meta.dir, "../package.json"), "utf8"),
    );
    const version = typeof pkg === "object" && pkg && "version" in pkg ? String(pkg.version) : "";
    expect(version).not.toBe("");
    for (const flag of ["--version", "-v"]) {
      expect(await shelf(flag)).toEqual({ exitCode: 0, stdout: `${version}\n`, stderr: "" });
    }
  });

  test("usage errors are one actionable line on stderr with exit code 1", async () => {
    const cases: Array<[string[], string]> = [
      [["add"], "✗ Missing required argument 'items'\n  Run: shelf add --help\n"],
      [["chek"], "✗ Unknown command 'chek'. Did you mean check?\n  Run: shelf --help\n"],
      [
        ["add", "button", "--overwrit"],
        "✗ Unknown option '--overwrit'. Did you mean --overwrite?\n  Run: shelf add --help\n",
      ],
      [
        ["check", "--only", "types"],
        `✗ Option '--only <steps>' argument 'types' is invalid. Unknown check step "types". Steps: config, provenance, dependencies, imports\n  Run: shelf check --help\n`,
      ],
      [
        ["init", "--registry"],
        "✗ Option '--registry <location>' argument missing\n  Run: shelf init --help\n",
      ],
    ];
    for (const [args, stderr] of cases) {
      expect(await shelf(...args)).toEqual({ exitCode: 1, stdout: "", stderr });
    }
  });

  test("a failing check exits 1 without an error line", async () => {
    const cwd = await tempDir("cli-check");
    await writeTree(cwd, { "shelf.config.json": json({ registry: "x" }), ".shelf/lock.json": "{" });
    const result = await shelf("check", "--cwd", cwd, "--only", "provenance");
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("✗ provenance   lock unreadable");
    expect(result.stderr).toBe("");
  });

  test("--cwd is honored by every command, before or after the command name", async () => {
    const registry = await fixtureRegistryDir();
    const app = await tempDir("cli-cwd");
    await writeTree(app, { "package.json": json({ name: "app" }) });
    const elsewhere = await tempDir("cli-elsewhere");

    expect((await runCli(["--cwd", app, "init", "--registry", registry], elsewhere)).exitCode).toBe(
      0,
    );
    expect(await Bun.file(path.join(app, "shelf.config.json")).exists()).toBe(true);

    const found = await runCli(["search", "card", "--cwd", app], elsewhere);
    expect(found.stdout).toBe("card  component   A card surface.\n");

    const consumer = await fixtureConsumer(registry);
    const added = await runCli(["add", "tokens", "--cwd", consumer, "--skip-install"], elsewhere);
    expect(added.exitCode).toBe(0);
    expect(await Bun.file(path.join(consumer, "src/styles/shelf/tokens.stylex.ts")).exists()).toBe(
      true,
    );

    const checked = await runCli(["check", "--cwd", consumer, "--only", "provenance"], elsewhere);
    expect(checked.stdout).toContain("✓ provenance   1 item, 1 file");
    expect(checked.exitCode).toBe(0);
  });

  test("unexpected errors are reported as internal, with a stack", () => {
    let stderr = "";
    const io = { stdout: () => {}, stderr: (text: string) => (stderr += text) };
    expect(handleError(new Error("boom"), io)).toBe(1);
    expect(stderr).toStartWith(
      "✗ Internal error in Shelf. Please report it with the output below.\n",
    );
    expect(stderr).toContain("Error: boom\n    at ");

    stderr = "";
    expect(handleError(new ShelfError("No registry given."), io)).toBe(1);
    expect(stderr).toBe("✗ No registry given.\n");
  });
});
