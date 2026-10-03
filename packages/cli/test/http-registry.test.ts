import { readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, test } from "bun:test";
import { add } from "../src/core/add";
import { readLock } from "../src/core/lock";
import { loadIndex, openRegistry } from "../src/core/registry";
import { serveRegistry } from "../src/serve";
import { capture, fixtureConsumer, fixtureRegistryDir, rejection } from "./helpers";

const servers: Array<{ stop(force?: boolean): void }> = [];
afterEach(() => {
  for (const server of servers.splice(0)) server.stop(true);
});

function serve(fetch: (request: Request) => Response | Promise<Response>) {
  const server = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch });
  servers.push(server);
  return server.url.toString();
}

describe("HTTP registry", () => {
  test("works with and without a trailing slash, and under a base path", async () => {
    const dir = await fixtureRegistryDir();
    const server = await serveRegistry(dir);
    servers.push(server);
    const root = server.url.toString();
    for (const location of [root, root.replace(/\/$/, "")]) {
      const index = await loadIndex(openRegistry(location));
      expect(index.map((entry) => entry.name)).toEqual(["tokens", "button", "card"]);
    }

    const prefixed = serve(async (request) => {
      const { pathname } = new URL(request.url);
      if (!pathname.startsWith("/r/v0/")) return new Response("no", { status: 404 });
      return fetch(new URL(pathname.slice("/r/v0".length), root));
    });
    const index = await loadIndex(openRegistry(`${prefixed}r/v0`));
    expect(index).toHaveLength(3);
  });

  test("refuses paths that resolve outside the registry", async () => {
    const root = serve(() => new Response("{}"));
    const registry = openRegistry(`${root}shelf/v0/`);
    expect(await rejection(registry.read("revisions/../../secret.json"))).toBe(
      `Registry path "revisions/../../secret.json" resolves outside ${root}shelf/v0/.`,
    );
  });

  test("404 names the URL", async () => {
    const url = serve(() => new Response("missing", { status: 404, statusText: "Not Found" }));
    expect(await rejection(loadIndex(openRegistry(url)))).toContain(
      `Registry returned 404 Not Found for ${url}index.json`,
    );
  });

  test("500 names the status", async () => {
    const url = serve(
      () => new Response("boom", { status: 500, statusText: "Internal Server Error" }),
    );
    expect(await rejection(loadIndex(openRegistry(url)))).toContain(
      "Registry returned 500 Internal Server Error",
    );
  });

  test("invalid JSON is reported as such", async () => {
    const url = serve(() => new Response("<html>not json</html>"));
    expect(await rejection(loadIndex(openRegistry(url)))).toContain(
      "Registry index.json is not valid JSON",
    );
  });

  test("connection refused is reported with the URL", async () => {
    const server = Bun.serve({ port: 0, fetch: () => new Response("") });
    const url = server.url.toString();
    await server.stop(true);
    expect(await rejection(loadIndex(openRegistry(url)))).toContain(
      `Could not reach registry at ${url}index.json`,
    );
  });

  test("a stalled server times out with a clear message", async () => {
    const url = serve(() => new Promise<Response>(() => {}));
    process.env["SHELF_REGISTRY_TIMEOUT_MS"] = "200";
    try {
      expect(await rejection(loadIndex(openRegistry(url)))).toContain(
        `Registry request timed out after 200ms: ${url}index.json. Set SHELF_REGISTRY_TIMEOUT_MS to wait longer.`,
      );
    } finally {
      delete process.env["SHELF_REGISTRY_TIMEOUT_MS"];
    }
  });

  test("the static server refuses paths outside the registry", async () => {
    const dir = await fixtureRegistryDir();
    const server = await serveRegistry(dir);
    servers.push(server);
    const ok = await fetch(new URL("/index.json", server.url));
    expect(ok.status).toBe(200);
    // The registry lives at <repo>/.tmp/tests/<dir>, so this targets the repo's real package.json.
    // Encoded slashes survive URL normalization and reach the server.
    const escape = await fetch(new URL("/..%2F..%2F..%2Fpackage.json", server.url));
    expect(escape.status).toBe(404);
  });

  test("local and HTTP registries produce byte-identical installs", async () => {
    const dir = await fixtureRegistryDir();
    const server = await serveRegistry(dir);
    servers.push(server);

    const local = await fixtureConsumer(dir);
    const remote = await fixtureConsumer(server.url.toString());
    for (const cwd of [local, remote]) {
      await add({ cwd, names: ["card"], overwrite: false, install: false, out: capture() });
    }

    const [localLock, remoteLock] = await Promise.all([readLock(local), readLock(remote)]);
    const comparable = (lock: typeof localLock) =>
      Object.fromEntries(
        Object.entries(lock.items).map(([name, item]) => [
          name,
          { ...item, registry: "<registry>", installedAt: "<time>" },
        ]),
      );
    expect(comparable(remoteLock)).toEqual(comparable(localLock));
    expect(localLock.items["card"]?.registry).toBe(dir);
    expect(remoteLock.items["card"]?.registry).toBe(server.url.toString());

    for (const target of Object.values(localLock.items).flatMap((item) =>
      Object.keys(item.files),
    )) {
      const [a, b] = await Promise.all([
        readFile(path.join(local, target)),
        readFile(path.join(remote, target)),
      ]);
      expect(b.equals(a)).toBe(true);
    }
  });
});
