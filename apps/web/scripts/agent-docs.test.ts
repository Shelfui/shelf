import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, test } from "bun:test";
import { buildAgentDocs, LLMS_LIMIT } from "./agent-docs";

const SITE = "https://docs.example.test";
const ROOT = path.join(import.meta.dir, "..");

let out: string;
let registryDocs: string;
let built: Awaited<ReturnType<typeof buildAgentDocs>>;

beforeAll(async () => {
  // The docs read the site's own .shelf/lock.json, relative to the working directory.
  process.chdir(ROOT);
  const dir = await mkdtemp(path.join(tmpdir(), "shelf-agent-docs-"));
  out = path.join(dir, "public");
  registryDocs = path.join(dir, "registry-docs");
  built = await buildAgentDocs({ out, site: SITE, registryDocs });
});

describe("agent docs", () => {
  test("every link in llms.txt is a page that was written", async () => {
    const llms = await readFile(path.join(out, "llms.txt"), "utf8");
    const links = [...llms.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((match) => match[1]);
    const own = links.filter((link) => link.startsWith(SITE));
    expect(own.length).toBeGreaterThan(10);
    for (const link of own) {
      const file = path.join(out, new URL(link).pathname);
      expect(await Bun.file(file).exists()).toBe(true);
    }
  });

  test("llms.txt stays small enough to read whole", () => {
    expect(built.llms.length).toBeLessThan(LLMS_LIMIT);
  });

  test("each docs page keeps the headings of its MDX source", async () => {
    for (const page of built.pages.filter((p) => !p.route.startsWith("/docs/components/"))) {
      const dir = path.join(ROOT, "src/app/(site)", page.route);
      const mdx = await readFile(path.join(dir, "page.mdx"), "utf8");
      const markdown = await readFile(path.join(out, `${page.route}.md`), "utf8");
      const headings = [...mdx.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
      for (const heading of headings) expect(markdown).toContain(`## ${heading}`);
      expect(markdown).toStartWith(`# ${page.title}\n`);
    }
  });

  test("no JSX or site-relative links leak into the Markdown", async () => {
    // Component pages quote demo source, which may use a component named Command.
    for (const page of built.pages.filter((p) => !p.route.startsWith("/docs/components/"))) {
      expect(page.markdown).not.toMatch(/<(Command|Diagram|File|PageHeader)\b/);
      expect(page.markdown).not.toMatch(/\]\(\/docs\//);
    }
  });

  test("shelf docs topics match the pages", async () => {
    const index = JSON.parse(await readFile(path.join(registryDocs, "index.json"), "utf8"));
    expect(index.topics.map((t: { topic: string }) => t.topic)).toContain("installation-vite");
    for (const topic of index.topics) {
      expect(await Bun.file(path.join(registryDocs, topic.path)).exists()).toBe(true);
    }
  });
});
