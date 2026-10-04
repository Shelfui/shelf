import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "bun:test";
import { add } from "../src/core/add";
import { check } from "../src/core/check";
import { update } from "../src/core/update";
import { capture, fixtureConsumer, fixtureRegistryDir, json } from "./helpers";

/** Situations that make a merge hard. Each must end with the user's work intact. */

const BUTTON = "src/components/ui/button.tsx";
const SOURCE = "components/button/button.tsx";

const V1 = `import { colors } from "../../foundations/tokens.stylex";

export const label = "Button";

export const size = "md";

export const variants = ["default", "outline"];

export const Button = () => colors.text;
`;

function git(cwd: string, ...args: string[]): void {
  const result = Bun.spawnSync(
    ["git", "-c", "user.name=Shelf", "-c", "user.email=shelf@example.com", ...args],
    { cwd },
  );
  if (result.exitCode !== 0) throw new Error(`git ${args.join(" ")}: ${result.stderr.toString()}`);
}

async function setup() {
  const registry = await fixtureRegistryDir({ [SOURCE]: V1 });
  const cwd = await fixtureConsumer(registry);
  git(cwd, "init", "-q");
  await add({ cwd, names: ["button"], overwrite: false, install: false, out: capture() });
  git(cwd, "add", "-A");
  git(cwd, "commit", "-q", "-m", "shelf add");
  return { registry, cwd };
}

async function run(fn: (out: ReturnType<typeof capture>) => Promise<unknown>) {
  const out = capture();
  await fn(out);
  return out.text();
}

describe("hard merges", () => {
  test("a heavy local rewrite and an upstream change in one place conflict, and nothing is lost", async () => {
    const { registry, cwd } = await setup();
    const rewrite = `import { colors } from "../../styles/shelf/tokens.stylex";

// Acme's own button. Everything below is ours.
export const label = "Acme button";
export const size = "xl";
export const variants = ["brand", "quiet"];

export const Button = () => [colors.text, "acme"];
`;
    await writeFile(path.join(cwd, BUTTON), rewrite);
    await writeFile(path.join(registry, SOURCE), V1.replace(`"md"`, `"lg"`));

    const text = await run((out) =>
      update({ cwd, names: ["button"], overwrite: false, install: false, out }),
    );

    expect(text).toContain("conflict");
    const merged = await readFile(path.join(cwd, BUTTON), "utf8");
    // Every line the team wrote is still in the file, either side of the markers.
    for (const line of rewrite.split("\n").filter(Boolean)) expect(merged).toContain(line);
    expect(merged).toContain("<<<<<<< yours");
    expect(await check({ cwd, only: ["provenance"], verbose: false, out: capture() })).toBe(false);
  });

  test("an upstream change in a different region than the local edit merges without conflict", async () => {
    const { registry, cwd } = await setup();
    const file = path.join(cwd, BUTTON);
    await writeFile(
      file,
      (await readFile(file, "utf8")).replace(
        `["default", "outline"]`,
        `["default", "outline", "brand"]`,
      ),
    );
    await writeFile(path.join(registry, SOURCE), V1.replace(`"Button"`, `"Action"`));

    const text = await run((out) =>
      update({ cwd, names: ["button"], overwrite: false, install: false, out }),
    );

    expect(text).not.toContain("conflict");
    const merged = await readFile(file, "utf8");
    expect(merged).toContain(`"brand"`);
    expect(merged).toContain(`"Action"`);
  });

  test("a file Shelf renames arrives under the new name and the old copy stays yours", async () => {
    const { registry, cwd } = await setup();
    const file = path.join(cwd, BUTTON);
    await writeFile(file, `${await readFile(file, "utf8")}// Acme: keep this.\n`);

    await rename(
      path.join(registry, "components/button/button.tsx"),
      path.join(registry, "components/button/action.tsx"),
    );
    await writeFile(
      path.join(registry, "components/button/registry.json"),
      json({
        name: "button",
        type: "component",
        description: "A button.",
        files: [{ path: "action.tsx" }],
        dependencies: { "@base-ui/react": "^1.8.0" },
        shelfDependencies: ["tokens"],
      }),
    );

    await run((out) => update({ cwd, names: ["button"], overwrite: false, install: false, out }));

    expect(await readFile(file, "utf8")).toContain("// Acme: keep this.");
    expect(await readFile(path.join(cwd, "src/components/ui/action.tsx"), "utf8")).toContain(
      `export const label = "Button";`,
    );
  });
});
