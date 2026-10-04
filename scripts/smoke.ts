import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

const USAGE = `Usage: bun scripts/smoke.ts --registry <url> [--cli <spec>] [--items button,dialog]

Installs the CLI the way a new user does, in an empty directory outside this repo, and walks the
whole ownership loop against a registry: init, add, edit, status, diff, check.

  --registry  Where the registry is served, such as https://ui.example.com/
  --cli       What to install. A version or tag from npm (default: @shelfui/cli@latest), or a
              tarball such as file:/tmp/shelfui-cli-0.1.0.tgz.
  --items     Items to add (default: button,dialog).

Run it after a release is approved, against the published package and the hosted registry.
`;

const { values } = parseArgs({
  options: {
    registry: { type: "string" },
    cli: { type: "string", default: "@shelfui/cli@latest" },
    items: { type: "string", default: "button,dialog" },
    help: { type: "boolean", default: false },
  },
});

if (values.help || !values.registry) {
  process.stdout.write(USAGE);
  process.exit(values.help ? 0 : 1);
}

const registry = values.registry;
const items = values.items.split(",").filter(Boolean);
const dir = await mkdtemp(path.join(tmpdir(), "shelf-smoke-"));
let step = "";

async function run(label: string, command: string[]): Promise<string> {
  step = label;
  const proc = Bun.spawn(command, { cwd: dir, stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code !== 0) {
    throw new Error(`${label} failed (exit ${code}):\n${command.join(" ")}\n${stdout}${stderr}`);
  }
  process.stdout.write(`ok  ${label}\n`);
  return stdout;
}

function expect(condition: boolean, message: string): void {
  if (!condition) throw new Error(`${step}: ${message}`);
}

const shelf = (...args: string[]) => ["bunx", "shelf", ...args];

try {
  await writeFile(
    path.join(dir, "package.json"),
    `${JSON.stringify({ name: "smoke", private: true, type: "module" }, null, 2)}\n`,
  );
  await run("install the CLI", ["bun", "add", "-d", values.cli]);
  await run("init", shelf("init", "--registry", registry, "--no-agents"));
  const search = await run("search", shelf("search", "button", "--json"));
  expect(search.includes('"button"'), "search did not find button");

  await run("add", shelf("add", ...items));
  const lock = JSON.parse(await readFile(path.join(dir, ".shelf/lock.json"), "utf8"));
  for (const item of items) expect(item in lock.items, `${item} is missing from the lock`);

  // The documented habit: commit right after `shelf add`, so BASE is always recoverable.
  await run("git init", ["git", "init", "-q"]);
  await run("git add", ["git", "add", "-A"]);
  await run("commit the install", [
    "git",
    "-c",
    "user.name=Shelf",
    "-c",
    "user.email=smoke@example.com",
    "commit",
    "-q",
    "-m",
    "shelf add",
  ]);

  const status = await run("status is clean after add", shelf("status"));
  expect(/up to date/i.test(status), `status was not clean:\n${status}`);

  const file = path.join(dir, "src/components/ui/button.tsx");
  const original = await readFile(file, "utf8");
  expect(!original.includes("lucide-react"), "button imports lucide-react directly");
  await writeFile(file, `${original}\n// smoke: local change\n`);

  const modified = await run("status sees the local change", shelf("status"));
  expect(/modified|changed/i.test(modified), `status did not report the edit:\n${modified}`);
  const diff = await run("diff --local shows the edit", shelf("diff", "button", "--local"));
  expect(diff.includes("smoke: local change"), "diff --local did not show the edit");

  await run("check", shelf("check"));
  process.stdout.write(`\nSmoke test passed for ${registry} with ${values.cli}.\n`);
} catch (error) {
  process.stderr.write(`\n${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
} finally {
  await rm(dir, { recursive: true, force: true });
}
