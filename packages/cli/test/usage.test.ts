import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, test } from "bun:test";
import { add } from "../src/core/add";
import { readConfig } from "../src/core/config";
import { repoKey } from "../src/core/github";
import { imports } from "../src/core/imports";
import { type UsageGraph, collectUsage, reportUsage, usageJson } from "../src/core/usage";
import { capture, fixtureRegistry, json, rejection, runCli, tempDir, writeTree } from "./helpers";

const DEPENDENCIES = { "@stylexjs/stylex": "0.19.1", "@base-ui/react": "1.8.0" };

function git(cwd: string, ...args: string[]): void {
  const result = Bun.spawnSync(
    ["git", "-c", "user.name=Shelf", "-c", "user.email=shelf@example.com", ...args],
    { cwd },
  );
  if (result.exitCode !== 0) throw new Error(`git ${args.join(" ")}: ${result.stderr.toString()}`);
}

const install = (cwd: string, names: string[]) =>
  add({ cwd, names, overwrite: false, install: false, out: capture() });

/**
 * A company monorepo:
 * - `registry/`, committed twice so the first button revision is in its history
 * - `apps/old` (growth/onboarding) installed button before the second commit
 * - `packages/ui` (platform/ui, `@acme/ui`) installed card, which brings button and tokens
 * - `apps/bill-pay` has no Shelf config; it imports `@acme/ui` and `@acme/ui/button`
 * - `apps/cards` (payments/cards) installed button, imports it through an alias, and edited it
 * - `apps/legacy` has no package name; its button came from another registry
 */
async function company() {
  const root = await tempDir("usage");
  const registry = Object.fromEntries(
    Object.entries(fixtureRegistry()).map(([file, content]) => [`registry/${file}`, content]),
  );
  const app = (config: object) => ({
    "package.json": json({ private: true, dependencies: DEPENDENCIES }),
    "shelf.config.json": json({ registry: "../../registry", ...config }),
  });
  await writeTree(root, {
    "package.json": json({ name: "acme", private: true, workspaces: ["apps/*", "packages/*"] }),
    ".gitignore": "node_modules\n",
    ...registry,
    ...prefix("apps/old", app({ project: "growth/onboarding" })),
  });
  git(root, "init", "-q");
  git(root, "add", "-A");
  git(root, "commit", "-q", "-m", "registry v1");
  await install(path.join(root, "apps/old"), ["button"]);

  const buttonSource = path.join(root, "registry/components/button/button.tsx");
  await writeFile(
    buttonSource,
    `${await readFile(buttonSource, "utf8")}export const size = "lg";\n`,
  );
  git(root, "add", "-A");
  git(root, "commit", "-q", "-m", "registry v2");

  await writeTree(root, {
    ...prefix("packages/ui", {
      ...app({ project: "platform/ui" }),
      "package.json": json({
        name: "@acme/ui",
        dependencies: DEPENDENCIES,
        exports: { ".": "./src/index.ts", "./*": "./src/components/ui/*.tsx" },
      }),
      "src/index.ts": `export { Card } from "./components/ui/card";\nexport * from "./components/ui/button";\n`,
    }),
    ...prefix("apps/bill-pay", {
      "package.json": json({ name: "@acme/bill-pay", dependencies: { "@acme/ui": "*" } }),
      "src/pay.tsx": `import { Card } from "@acme/ui";\nimport type { Props } from "@acme/ui";\nexport const Pay = () => Card;\n`,
      "src/submit.tsx": `import { Button as Submit } from "@acme/ui/button";\nexport const S = Submit;\n`,
    }),
    ...prefix("apps/cards", {
      ...app({ project: "payments/cards", aliases: { "@/*": "src/*" } }),
      "src/page.tsx": `import { Button } from "@/components/ui/button";\nexport const Page = () => Button;\n`,
    }),
    ...prefix("apps/legacy", {
      "package.json": json({ private: true, dependencies: DEPENDENCIES }),
      "shelf.config.json": json({ registry: "../../registry" }),
      "src/main.tsx": `import { Button } from "./components/ui/button";\nexport default Button;\n`,
    }),
  });
  await install(path.join(root, "packages/ui"), ["card"]);
  await install(path.join(root, "apps/cards"), ["button"]);
  await install(path.join(root, "apps/legacy"), ["button"]);
  const cardsButton = path.join(root, "apps/cards/src/components/ui/button.tsx");
  await writeFile(cardsButton, `// ours\n${await readFile(cardsButton, "utf8")}`);
  const legacyLock = path.join(root, "apps/legacy/.shelf/lock.json");
  const lock = JSON.parse(await readFile(legacyLock, "utf8"));
  lock.items.button.revision = "f".repeat(64);
  await writeFile(legacyLock, json(lock));
  git(root, "add", "-A");
  git(root, "commit", "-q", "-m", "projects");
  return root;
}

function prefix(dir: string, files: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(files).map(([file, c]) => [`${dir}/${file}`, c]));
}

const byId = (graph: UsageGraph, id: string) => {
  const project = graph.projects.find((p) => p.id === id);
  if (!project)
    throw new Error(`no project ${id} in ${graph.projects.map((p) => p.id).join(", ")}`);
  return project;
};

/** The graph without where it was read from, to compare a clone with its source. */
function withoutRepo(graph: UsageGraph) {
  return graph.projects.map(({ source: { path: dir, commit }, ...rest }) => ({
    dir,
    commit,
    ...rest,
  }));
}

describe("shelf usage", () => {
  test("builds one graph for every project in a monorepo", async () => {
    const root = await company();
    const graph = await collectUsage({ cwd: root, dirs: ["."], repos: [], registry: "registry" });

    expect(graph.projects.map((p) => [p.id, p.namespace, p.source.path])).toEqual([
      ["acme/bill-pay", "acme", "apps/bill-pay"],
      ["apps/legacy", "apps", "apps/legacy"],
      ["growth/onboarding", "growth", "apps/old"],
      ["payments/cards", "payments", "apps/cards"],
      ["platform/ui", "platform", "packages/ui"],
    ]);
    expect(Object.keys(graph.registry!.items)).toEqual(["tokens", "button", "card"]);
    for (const project of graph.projects) {
      expect(project.source.commit).toMatch(/^[0-9a-f]{40}$/);
    }
  });

  test("credits a shared package's items to the apps that import it", async () => {
    const graph = await collectUsage({
      cwd: await company(),
      dirs: ["."],
      repos: [],
      registry: "registry",
    });
    const ui = byId(graph, "platform/ui");
    expect(ui.items["card"]!.direct).toBe(true);
    expect(ui.items["card"]!.usedBy).toEqual([
      { file: "src/pay.tsx", imports: ["Card"], project: "acme/bill-pay", package: "@acme/ui" },
    ]);
    expect(ui.items["button"]!.usedBy).toEqual([
      {
        file: "src/submit.tsx",
        imports: ["Submit"],
        project: "acme/bill-pay",
        package: "@acme/ui",
      },
    ]);
    expect(byId(graph, "acme/bill-pay")).toMatchObject({
      items: {},
      consumes: [
        { item: "button", provider: "platform/ui", package: "@acme/ui" },
        { item: "card", provider: "platform/ui", package: "@acme/ui" },
      ],
    });
  });

  test("an item used only through another item is used via it, not unused", async () => {
    const graph = await collectUsage({
      cwd: await company(),
      dirs: ["."],
      repos: [],
      registry: "registry",
    });
    const ui = byId(graph, "platform/ui").items;
    expect(ui["button"]).toMatchObject({ direct: true, via: ["card"] });
    expect(ui["tokens"]).toMatchObject({ direct: false, via: ["button", "card"] });

    const old = byId(graph, "growth/onboarding").items;
    expect(old["button"]).toMatchObject({ direct: false, via: [] });
    expect(old["tokens"]).toMatchObject({ direct: false, via: [] });
  });

  test("reports updates, local changes, and items from another registry", async () => {
    const graph = await collectUsage({
      cwd: await company(),
      dirs: ["."],
      repos: [],
      registry: "registry",
    });
    const current = graph.registry!.items["button"]!.revision;

    expect(byId(graph, "growth/onboarding").items["button"]).toMatchObject({
      registry: "this",
      updateAvailable: true,
      upstream: current,
      modified: false,
    });
    expect(byId(graph, "payments/cards").items["button"]).toMatchObject({
      registry: "this",
      updateAvailable: false,
      modified: true,
      modifiedFiles: ["src/components/ui/button.tsx"],
      direct: true,
      usedBy: [{ file: "src/page.tsx", imports: ["Button"] }],
    });
    expect(byId(graph, "apps/legacy").items["button"]).toMatchObject({
      registry: "other",
      updateAvailable: false,
      upstream: null,
      removed: false,
    });
  });

  test("scans a cloned repository like a local one", async () => {
    const root = await company();
    const bare = path.join(await tempDir("bare"), "acme.git");
    git(root, "clone", "-q", "--bare", root, bare);

    const local = await collectUsage({ cwd: root, dirs: ["."], repos: [], registry: "registry" });
    const cloned = await collectUsage({
      cwd: root,
      dirs: [],
      repos: [`file://${bare}`],
      registry: "registry",
    });
    expect(cloned.projects.map((p) => p.source.repo)).toEqual(
      local.projects.map(() => `file://${bare}`),
    );
    expect(withoutRepo(cloned)).toEqual(withoutRepo(local));
  });

  test("compares each project with its own registry when none is passed", async () => {
    const root = await company();
    const graph = await collectUsage({ cwd: root, dirs: ["apps/old"], repos: [] });
    expect(graph.registry).toBeNull();
    expect(graph.projects.map((p) => p.id)).toEqual(["growth/onboarding"]);
    expect(graph.projects[0]!.items["button"]!.updateAvailable).toBe(true);
  });

  test("marks every item unknown when the registry can't be read", async () => {
    const root = await company();
    const config = path.join(root, "apps/old/shelf.config.json");
    await writeFile(config, json({ registry: "../../missing", project: "growth/onboarding" }));
    const graph = await collectUsage({ cwd: root, dirs: ["apps/old"], repos: [] });
    expect(graph.projects[0]!.registryError).toContain("Registry directory not found");
    expect(graph.projects[0]!.items["button"]).toMatchObject({
      registry: "unknown",
      updateAvailable: false,
      modified: false,
    });
  });

  test("the same repository always produces the same bytes", async () => {
    const root = await company();
    const options = { cwd: root, dirs: ["."], repos: [], registry: "registry" };
    expect(usageJson(await collectUsage(options))).toBe(usageJson(await collectUsage(options)));
  });

  test("two projects with one id fail with the fix", async () => {
    const root = await company();
    const config = path.join(root, "apps/cards/shelf.config.json");
    await writeFile(config, json({ registry: "../../registry", project: "platform/ui" }));
    expect(
      await rejection(collectUsage({ cwd: root, dirs: ["."], repos: [], registry: "registry" })),
    ).toContain(`Two projects are both "platform/ui"`);
  });

  test("the text report names the command that fixes each finding", async () => {
    const root = await company();
    const out = capture();
    reportUsage(
      await collectUsage({ cwd: root, dirs: ["."], repos: [], registry: "registry" }),
      out,
    );
    const text = out.text();
    expect(text).toContain("↑ button: update available. Run: shelf update button (in apps/old)");
    expect(text).toContain(
      "~ button: modified locally. See: shelf diff button --local (in apps/cards)",
    );
    expect(text).toContain("- button: installed, not imported");
    expect(text).toContain("uses from platform/ui: button, card");
  });

  test("the CLI prints the graph as JSON", async () => {
    const root = await company();
    const { stdout, exitCode } = await runCli(
      ["usage", "apps/cards", "--registry", "registry", "--json"],
      root,
    );
    expect(exitCode).toBe(0);
    const graph: UsageGraph = JSON.parse(stdout);
    expect(graph.projects.map((p) => p.id)).toEqual(["payments/cards"]);
  });
});

describe("shelf usage --github", () => {
  const servers: Array<{ stop(force?: boolean): void }> = [];
  afterEach(() => {
    for (const server of servers.splice(0)) server.stop(true);
  });

  function serve(fetch: (request: Request) => Response) {
    const server = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch });
    servers.push(server);
    return server.url.toString().replace(/\/$/, "");
  }

  test("scans every repo in the organization that has a shelf.config.json, each once", async () => {
    const root = await company();
    const server = await tempDir("github");
    git(root, "remote", "add", "origin", `file://${server}/acme/monorepo.git`);
    const web = await tempDir("web");
    await writeTree(web, {
      "package.json": json({ private: true }),
      "shelf.config.json": json({ registry: "https://registry.acme.dev", project: "growth/web" }),
    });
    git(web, "init", "-q");
    git(web, "add", "-A");
    git(web, "commit", "-q", "-m", "web");
    git(web, "clone", "-q", "--bare", web, path.join(server, "acme/web.git"));

    const requests: Array<{ url: URL; authorization: string | null }> = [];
    const api = serve((request) => {
      requests.push({
        url: new URL(request.url),
        authorization: request.headers.get("authorization"),
      });
      return Response.json({
        items: ["acme/web", "acme/web", "acme/monorepo"].map((name) => ({
          repository: { full_name: name },
        })),
      });
    });
    const graph = await collectUsage({
      cwd: root,
      dirs: ["."],
      repos: [],
      github: { token: "secret", api, server: `file://${server}`, orgs: ["acme"] },
      registry: "registry",
    });

    const [search] = requests;
    expect(search!.url.pathname).toBe("/search/code");
    expect(search!.url.searchParams.get("q")).toBe("filename:shelf.config.json org:acme");
    expect(search!.authorization).toBe("Bearer secret");
    expect(byId(graph, "growth/web").source.repo).toBe(`file://${server}/acme/web.git`);
    expect(byId(graph, "platform/ui").source.repo).toBe(`file://${server}/acme/monorepo.git`);
  });

  test("a rejected token names the variable to fix", async () => {
    const root = await company();
    const api = serve(() => new Response("{}", { status: 401, statusText: "Unauthorized" }));
    const github = { token: "bad", api, server: "https://github.com", orgs: ["acme"] };
    expect(await rejection(collectUsage({ cwd: root, dirs: [], repos: [], github }))).toBe(
      "GitHub rejected the token (401 Unauthorized). Set GH_TOKEN or GITHUB_TOKEN to a valid token.",
    );
  });

  test("the CLI asks for a token when none is set", async () => {
    const root = await company();
    const { stderr, exitCode } = await runCli(["usage", "--github", "acme"], root, {
      GH_TOKEN: "",
      GITHUB_TOKEN: "",
    });
    expect(exitCode).not.toBe(0);
    expect(stderr).toContain("--github needs a token. Set GH_TOKEN or GITHUB_TOKEN");
  });

  test("the same repository has one key however its URL is written", () => {
    const urls = [
      "https://github.com/Acme/web",
      "https://github.com/acme/web.git",
      "https://x-access-token:abc@github.com/acme/web.git/",
      "git@github.com:acme/web.git",
      "ssh://git@github.com/acme/web",
    ];
    expect(new Set(urls.map(repoKey))).toEqual(new Set(["github.com/acme/web"]));
  });
});

describe("project ids", () => {
  test("shelf.config.json validates project", async () => {
    const dir = await tempDir("config");
    await writeTree(dir, { "shelf.config.json": json({ registry: "r", project: "a b" }) });
    expect(await rejection(readConfig(dir))).toContain(`"project" must be an id`);
    await writeTree(dir, { "shelf.config.json": json({ registry: "r", project: "team/app" }) });
    expect((await readConfig(dir)).project).toBe("team/app");
  });
});

describe("import parsing", () => {
  test("records the names each import binds", () => {
    expect(
      imports(`import React, { useState as useS, type FC } from "react";
import * as Dialog from "./dialog";
import type { Props } from "./types";
import "./side-effect.css";
export { Button } from "./button";
const Lazy = import("./lazy");
import {
  Card,
  CardHeader,
} from "@/components/ui/card";`),
    ).toEqual([
      { specifier: "react", names: ["useS", "React"], reexport: false },
      { specifier: "./dialog", names: ["Dialog"], reexport: false },
      { specifier: "./side-effect.css", names: [], reexport: false },
      { specifier: "./button", names: [], reexport: true },
      { specifier: "./lazy", names: [], reexport: false },
      { specifier: "@/components/ui/card", names: ["Card", "CardHeader"], reexport: false },
    ]);
  });
});
