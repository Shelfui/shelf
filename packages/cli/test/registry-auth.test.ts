import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, test } from "bun:test";
import { add } from "../src/core/add";
import { readBase } from "../src/core/base";
import { build } from "../src/core/build";
import { init } from "../src/core/init";
import { search } from "../src/core/search";
import { capture, fixtureConsumer, fixtureRegistryDir, json, rejection, tempDir } from "./helpers";

const TOKEN = "s3cret-token";
const VARIABLE = "SHELF_TEST_REGISTRY_TOKEN";
const BUTTON = "src/components/ui/button.tsx";

const servers: Array<{ stop(): void }> = [];
afterEach(() => {
  for (const server of servers.splice(0)) server.stop();
  delete process.env[VARIABLE];
});

/**
 * Serves `dir` under /registry/ to requests with `X-API-Key: <TOKEN>`. /same/ redirects to
 * /registry/ on this origin, /cross/ to another origin, which records the headers it gets.
 */
function serve(dir: string) {
  const seenElsewhere: Array<string | null> = [];
  const elsewhere = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch(request) {
      seenElsewhere.push(request.headers.get("x-api-key"));
      return new Response("login page");
    },
  });
  const registry = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/same/")) {
        return Response.redirect(url.pathname.replace("/same/", "/registry/"), 302);
      }
      if (url.pathname.startsWith("/cross/")) {
        return Response.redirect(`${elsewhere.url.origin}/login`, 302);
      }
      if (request.headers.get("x-api-key") !== TOKEN) {
        return Response.json(
          { error: "Unauthorized", message: "Token expired.\u001b[31m Renew it at example.com." },
          { status: 401 },
        );
      }
      const file = Bun.file(path.join(dir, url.pathname.replace(/^\/registry\//, "")));
      if (!url.pathname.startsWith("/registry/") || !(await file.exists())) {
        return new Response("not found", { status: 404 });
      }
      return new Response(file);
    },
  });
  servers.push(registry, elsewhere);
  return { origin: registry.url.origin, seenElsewhere };
}

function config(url: string, headers: Record<string, string> = { "X-API-Key": `\${${VARIABLE}}` }) {
  return { "shelf.config.json": json({ registry: { url, headers } }) };
}

async function addButton(cwd: string) {
  const out = capture();
  await add({ cwd, names: ["button"], overwrite: false, install: false, out });
  return out.text();
}

describe("private registries", () => {
  test("headers expand ${VAR} from the environment, and the lock records only the URL", async () => {
    const { origin } = serve(await fixtureRegistryDir());
    const url = `${origin}/registry/`;
    const cwd = await fixtureConsumer("unused", config(url));
    process.env[VARIABLE] = TOKEN;

    expect(await addButton(cwd)).toContain("Button and Tokens are now yours.");
    const lock = await readFile(path.join(cwd, ".shelf/lock.json"), "utf8");
    expect(JSON.parse(lock).items.button.registry).toBe(url);
    expect(lock).not.toContain(TOKEN);
    expect(await readFile(path.join(cwd, "shelf.config.json"), "utf8")).not.toContain(TOKEN);
  });

  test("a variable can come from .env.local when it isn't in the environment", async () => {
    const { origin } = serve(await fixtureRegistryDir());
    const cwd = await fixtureConsumer("unused", {
      ...config(`${origin}/registry/`),
      ".env": `${VARIABLE}=wrong\n`,
      ".env.local": `${VARIABLE}=${TOKEN}\n`,
    });
    expect(await addButton(cwd)).toContain("are now yours.");
  });

  test("a missing variable fails before any request", async () => {
    const cwd = await fixtureConsumer("unused", config("https://registry.invalid/"));
    expect(await rejection(addButton(cwd))).toBe(
      `Registry headers in shelf.config.json need ${VARIABLE}. Set it in your environment or .env.local.`,
    );
  });

  test("a 401 shows the server's message, cleaned, and how to authenticate", async () => {
    const { origin } = serve(await fixtureRegistryDir());
    const bare = await fixtureConsumer(`${origin}/registry/`);
    const withoutHeaders = await rejection(addButton(bare));
    expect(withoutHeaders).toContain(
      `Registry returned 401 Unauthorized for ${origin}/registry/index.json: Token expired. Renew it at example.com.`,
    );
    expect(withoutHeaders).toContain(
      `This registry needs authentication. Add "headers" to "registry"`,
    );

    const cwd = await fixtureConsumer("unused", config(`${origin}/registry/`));
    process.env[VARIABLE] = "not-the-token";
    const wrong = await rejection(addButton(cwd));
    expect(wrong).toContain(`Check that ${VARIABLE} is valid for this registry.`);
    expect(wrong).not.toContain("not-the-token");
  });

  test("headers are never sent over plain http to another host", async () => {
    const cwd = await fixtureConsumer("unused", config("http://registry.example.com/"));
    process.env[VARIABLE] = TOKEN;
    expect(await rejection(addButton(cwd))).toBe(
      "Refusing to send registry headers over http://registry.example.com. Use an https:// registry URL.",
    );
  });

  test("same-origin redirects keep headers; a cross-origin redirect stops before sending them", async () => {
    const { origin, seenElsewhere } = serve(await fixtureRegistryDir());
    process.env[VARIABLE] = TOKEN;
    const same = await fixtureConsumer("unused", config(`${origin}/same/`));
    expect(await addButton(same)).toContain("are now yours.");

    const cross = await fixtureConsumer("unused", config(`${origin}/cross/`));
    expect(await rejection(addButton(cross))).toContain(
      `Registry redirected ${origin}/cross/index.json to http://127.0.0.1:`,
    );
    expect(seenElsewhere).toEqual([]);
  });

  test("a 404 for index.json with headers hints that the token may lack access", async () => {
    const { origin } = serve(await fixtureRegistryDir());
    process.env[VARIABLE] = TOKEN;
    const cwd = await fixtureConsumer("unused", config(`${origin}/registry/nested/`));
    expect(await rejection(addButton(cwd))).toContain(
      "(a private host may answer 404 when the token has no access)",
    );
  });

  test("BASE is recovered from a private registry's revisions", async () => {
    const outDir = path.join(await tempDir("auth-build"), "registry");
    await build({ cwd: "/", source: await fixtureRegistryDir(), outDir, out: capture() });
    const { origin } = serve(outDir);
    process.env[VARIABLE] = TOKEN;
    const cwd = await fixtureConsumer("unused", config(`${origin}/registry/`));
    await addButton(cwd);
    const installed = await readFile(path.join(cwd, BUTTON), "utf8");
    await writeFile(path.join(cwd, BUTTON), "// mine\n");
    expect((await readBase(cwd, "button")).get(BUTTON)).toBe(installed);
  });

  test("init --header writes the header unexpanded and uses it", async () => {
    const { origin } = serve(await fixtureRegistryDir());
    process.env[VARIABLE] = TOKEN;
    const cwd = await tempDir("auth-init");
    await writeFile(path.join(cwd, "package.json"), json({ name: "app" }));
    const out = capture();
    await init({
      cwd,
      registry: `${origin}/registry/`,
      header: [`X-API-Key: \${${VARIABLE}}`],
      agents: false,
      out,
    });
    expect(out.text()).toContain("3 items");
    const written = JSON.parse(await readFile(path.join(cwd, "shelf.config.json"), "utf8"));
    expect(written.registry).toEqual({
      url: `${origin}/registry/`,
      headers: { "X-API-Key": `\${${VARIABLE}}` },
    });

    const found = capture();
    await search({ cwd, query: "card", registry: undefined, out: found });
    expect(found.text()).toBe("card  component   A card surface.");
  });
});
