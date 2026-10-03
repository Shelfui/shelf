import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, test } from "bun:test";
import { add } from "../src/core/add";
import { build } from "../src/core/build";
import { check } from "../src/core/check";
import { diff } from "../src/core/diff";
import { LOCK_FILE, hashContent, readLock } from "../src/core/lock";
import { status } from "../src/core/status";
import { update } from "../src/core/update";
import { serveRegistry } from "../src/serve";
import { capture, fixtureConsumer, fixtureRegistryDir, json, rejection, tempDir } from "./helpers";

const BUTTON = "src/components/ui/button.tsx";
const CARD = "src/components/ui/card.tsx";
const SOURCE = "components/button/button.tsx";
// How V1 installs: its import points at where the consumer keeps foundations.
const installed = (source: string) => source.replace("../../foundations/", "../../styles/shelf/");
const V1 = `import { colors } from "../../foundations/tokens.stylex";

export const label = "Button";

export const size = "md";

export const Button = () => colors.text;
`;

const servers: Array<{ stop(): void }> = [];
afterEach(() => {
  for (const server of servers.splice(0)) server.stop();
});

function git(cwd: string, ...args: string[]): void {
  const result = Bun.spawnSync(
    ["git", "-c", "user.name=Shelf", "-c", "user.email=shelf@example.com", ...args],
    { cwd },
  );
  if (result.exitCode !== 0) throw new Error(`git ${args.join(" ")}: ${result.stderr.toString()}`);
}

/** A consumer that committed right after installing, as the docs recommend. */
async function setup(names = ["button"]) {
  const registry = await fixtureRegistryDir({ [SOURCE]: V1 });
  const cwd = await fixtureConsumer(registry);
  git(cwd, "init", "-q");
  await add({ cwd, names, overwrite: false, install: false, out: capture() });
  git(cwd, "add", "-A");
  git(cwd, "commit", "-q", "-m", "shelf add");
  return { registry, cwd };
}

const edit = (file: string, from: string, to: string) =>
  readFile(file, "utf8").then((text) => writeFile(file, text.replace(from, to)));

async function run(fn: (out: ReturnType<typeof capture>) => Promise<unknown>) {
  const out = capture();
  await fn(out);
  return out.text();
}

describe("the update loop", () => {
  test("status lists what you changed and what Shelf updated", async () => {
    const { registry, cwd } = await setup(["card"]);
    await edit(path.join(cwd, BUTTON), `"Button"`, `"Mine"`);
    await edit(path.join(registry, SOURCE), `"md"`, `"lg"`);

    expect(await run((out) => status({ cwd, names: [], out }))).toBe(
      [
        "Shelf status",
        "",
        "  button  modified locally, update available",
        "  card    up to date",
        "  tokens  up to date",
        "",
        "1 update available, 1 with local changes to merge. See: shelf diff <item>. Run: shelf update",
      ].join("\n"),
    );
  });

  test("diff shows Shelf's changes, and --local shows yours", async () => {
    const { registry, cwd } = await setup();
    await edit(path.join(cwd, BUTTON), `"Button"`, `"Mine"`);
    await edit(path.join(registry, SOURCE), `"md"`, `"lg"`);

    const shelf = await run((out) => diff({ cwd, name: "button", local: false, out }));
    expect(shelf).toContain(`--- base/${BUTTON}\n+++ shelf/${BUTTON}`);
    expect(shelf).toContain(`-export const size = "md";\n+export const size = "lg";`);
    expect(shelf).not.toContain("Mine");

    const yours = await run((out) => diff({ cwd, name: "button", local: true, out }));
    expect(yours).toContain(`+++ yours/${BUTTON}`);
    expect(yours).toContain(`-export const label = "Button";\n+export const label = "Mine";`);

    expect(await run((out) => diff({ cwd, name: "tokens", local: false, out }))).toBe(
      "Shelf's tokens hasn't changed since you installed it.",
    );
  });

  test("update merges Shelf's changes into your modified file and moves BASE forward", async () => {
    const { registry, cwd } = await setup();
    await edit(path.join(cwd, BUTTON), `"Button"`, `"Mine"`);
    await edit(path.join(registry, SOURCE), `"md"`, `"lg"`);

    const text = await run((out) =>
      update({ cwd, names: [], overwrite: false, install: false, out }),
    );
    expect(text).toContain(`✓ merged Shelf's changes into your modified ${BUTTON}`);
    const merged = await readFile(path.join(cwd, BUTTON), "utf8");
    expect(merged).toContain(`"Mine"`);
    expect(merged).toContain(`"lg"`);

    const upstream = installed(V1.replace(`"md"`, `"lg"`));
    const lock = await readLock(cwd);
    expect(lock.items["button"]!.files[BUTTON]!.baseHash).toBe(hashContent(upstream));
    expect(await run((out) => check({ cwd, only: ["provenance"], verbose: false, out }))).toContain(
      `~ ${BUTTON} (button, modified locally)`,
    );
    expect(
      await run((out) => update({ cwd, names: [], overwrite: false, install: false, out })),
    ).toContain("✓ Everything is up to date (2 items).");
  });

  test("a conflict leaves markers, and shelf check fails on them with the line", async () => {
    const { registry, cwd } = await setup();
    await edit(path.join(cwd, BUTTON), `"md"`, `"sm"`);
    await edit(path.join(registry, SOURCE), `"md"`, `"lg"`);

    const text = await run((out) =>
      update({ cwd, names: ["button"], overwrite: false, install: false, out }),
    );
    expect(text).toContain(`! merged ${BUTTON} with 1 conflict`);
    expect(text).toContain(
      "Resolve the conflicts between <<<<<<< yours and >>>>>>> shelf, then run: shelf check",
    );
    const merged = await readFile(path.join(cwd, BUTTON), "utf8");
    expect(merged).toContain(
      `<<<<<<< yours\nexport const size = "sm";\n=======\nexport const size = "lg";\n>>>>>>> shelf`,
    );

    const out = capture();
    expect(await check({ cwd, only: ["provenance"], verbose: false, out })).toBe(false);
    expect(out.text()).toContain(
      `${BUTTON}:5 has an unresolved conflict from shelf update. Resolve it, then run: shelf check`,
    );
  });

  test("unmodified files update, modified files Shelf didn't change are kept, new files are added", async () => {
    const { registry, cwd } = await setup(["card"]);
    await edit(path.join(cwd, CARD), "Card", "MyCard");
    await edit(path.join(registry, SOURCE), `"md"`, `"lg"`);
    await writeFile(
      path.join(registry, "components/button/button-icon.tsx"),
      "export const Icon = 1;\n",
    );
    await writeFile(
      path.join(registry, "components/button/registry.json"),
      json({
        name: "button",
        type: "component",
        description: "A button.",
        files: [{ path: "button.tsx" }, { path: "button-icon.tsx" }],
        dependencies: { "@base-ui/react": "^1.8.0" },
        shelfDependencies: ["tokens"],
      }),
    );

    const text = await run((out) =>
      update({ cwd, names: [], overwrite: false, install: false, out }),
    );
    expect(text).toContain("✓ added 1 file");
    expect(text).toContain("✓ updated 1 file");
    expect(await readFile(path.join(cwd, BUTTON), "utf8")).toBe(
      installed(V1.replace(`"md"`, `"lg"`)),
    );
    expect(await readFile(path.join(cwd, CARD), "utf8")).toContain("MyCard");
  });

  test("nothing is written when one file in the batch can't be merged", async () => {
    const { registry, cwd } = await setup();
    // card is installed after the commit, so its BASE is in neither git nor the registry.
    await add({ cwd, names: ["card"], overwrite: false, install: false, out: capture() });
    await edit(path.join(cwd, BUTTON), `"Button"`, `"Mine"`);
    await edit(path.join(cwd, CARD), "Card", "MyCard");
    await edit(path.join(registry, SOURCE), `"md"`, `"lg"`);
    await edit(
      path.join(registry, "components/card/card.tsx"),
      "export const Card",
      "export const Card2",
    );
    const before = await Promise.all(
      [BUTTON, CARD, LOCK_FILE].map((f) => readFile(path.join(cwd, f), "utf8")),
    );

    const message = await rejection(
      update({ cwd, names: [], overwrite: false, install: false, out: capture() }),
    );
    expect(message).toContain(
      `${CARD} (card: modified locally, and its BASE can't be recovered to merge)`,
    );
    expect(message).toContain("Nothing was changed.");
    const after = await Promise.all(
      [BUTTON, CARD, LOCK_FILE].map((f) => readFile(path.join(cwd, f), "utf8")),
    );
    expect(after).toEqual(before);
  });

  test("a package range Shelf changed is reported with the command", async () => {
    const { registry, cwd } = await setup();
    await writeFile(
      path.join(registry, "components/button/registry.json"),
      json({
        name: "button",
        type: "component",
        description: "A button.",
        files: [{ path: "button.tsx" }],
        dependencies: { "@base-ui/react": "^1.9.0" },
        shelfDependencies: ["tokens"],
      }),
    );
    const line =
      "! button now needs @base-ui/react@^1.9.0 (was ^1.8.0). Run: bun add @base-ui/react@^1.9.0";
    expect(await run((out) => status({ cwd, names: [], out }))).toContain(line);
    expect(
      await run((out) => update({ cwd, names: [], overwrite: false, install: false, out })),
    ).toContain(line);
  });

  test("a reformatted file points at shelf diff --local", async () => {
    const { registry, cwd } = await setup();
    await writeFile(path.join(cwd, BUTTON), V1.replaceAll('"', "'").replaceAll(";", ""));
    await edit(path.join(registry, SOURCE), `"md"`, `"lg"`);
    const text = await run((out) =>
      update({ cwd, names: [], overwrite: false, install: false, out }),
    );
    expect(text).toContain(
      "most of the file differs from BASE, likely reformatted. See: shelf diff button --local",
    );
  });

  test("update merges over HTTP with BASE from the built revisions, without git", async () => {
    const source = await fixtureRegistryDir({ [SOURCE]: V1 });
    const outDir = path.join(await tempDir("update-http"), "registry");
    await build({ cwd: "/", source, outDir, out: capture() });
    const server = await serveRegistry(outDir);
    servers.push(server);
    const cwd = await fixtureConsumer(server.url.toString());
    await add({ cwd, names: ["button"], overwrite: false, install: false, out: capture() });

    await edit(path.join(cwd, BUTTON), `"Button"`, `"Mine"`);
    await edit(path.join(source, SOURCE), `"md"`, `"lg"`);
    await build({ cwd: "/", source, outDir, out: capture() });

    const text = await run((out) =>
      update({ cwd, names: [], overwrite: false, install: false, out }),
    );
    expect(text).toContain(`✓ merged Shelf's changes into your modified ${BUTTON}`);
    const merged = await readFile(path.join(cwd, BUTTON), "utf8");
    expect(merged).toContain(`"Mine"`);
    expect(merged).toContain(`"lg"`);
  });

  test("status against a built registry is one request", async () => {
    const source = await fixtureRegistryDir({ [SOURCE]: V1 });
    const outDir = path.join(await tempDir("status-build"), "registry");
    await build({ cwd: "/", source, outDir, out: capture() });
    const requests: string[] = [];
    const server = Bun.serve({
      hostname: "127.0.0.1",
      port: 0,
      fetch(request) {
        requests.push(new URL(request.url).pathname);
        const file = Bun.file(path.join(outDir, new URL(request.url).pathname));
        return file
          .exists()
          .then((ok) => (ok ? new Response(file) : new Response("", { status: 404 })));
      },
    });
    servers.push(server);
    const cwd = await fixtureConsumer(server.url.origin);
    await add({ cwd, names: ["card"], overwrite: false, install: false, out: capture() });

    requests.length = 0;
    expect(await run((out) => status({ cwd, names: [], out }))).toContain(
      "✓ Everything is up to date (3 items).",
    );
    expect(requests).toEqual(["/index.json"]);
  });
});
