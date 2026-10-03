/**
 * Writes the Markdown an agent reads, from the same sources the site renders:
 *
 *   public/docs/<page>.md              each `page.mdx` under src/app/(site)/docs
 *   public/docs/components/<name>.md   each component in src/docs/components.ts
 *   public/llms.txt                    an index of both, under 50K characters
 *   public/llms-full.txt               everything in one file
 *   ../../registry/docs/               the doc pages again, as topics for `shelf docs`
 *
 * Run from apps/web: `bun scripts/agent-docs.ts`. The output is generated and not committed.
 */
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { components } from "../src/docs/components";
import { docGroups } from "../src/docs/pages";
import * as diagrams from "../src/docs/diagrams";
import { installedDependencies, installedFiles, usageExample } from "../src/docs/source";
import { siteConfig } from "../src/site";

const ROOT = path.resolve(import.meta.dir, "..");
const DOCS = path.join(ROOT, "src/app/(site)/docs");

/** llms.txt must fit in one fetch. */
export const LLMS_LIMIT = 50_000;

/** Base UI pages that are not named like the Shelf component. Others have no page. */
const BASE_UI_PAGE: Record<string, string | null> = {
  "dropdown-menu": "menu",
  "hover-card": "preview-card",
  command: null,
  "input-group": null,
  item: null,
  sidebar: null,
  textarea: null,
  "usage-explorer": null,
};

export interface DocPage {
  /** The site path, such as `/docs/installation/vite`. */
  route: string;
  title: string;
  description: string;
  markdown: string;
}

export async function buildAgentDocs(options: {
  out: string;
  site: string;
  /** Where to write the topics `shelf docs` prints, and their index. */
  registryDocs?: string;
}): Promise<{
  pages: DocPage[];
  llms: string;
  llmsFull: string;
}> {
  const { out, site, registryDocs } = options;
  const mdx = await readMdxPages(DOCS);
  const order = docGroups.flatMap((group) => group.links.map((link) => link.href));
  const rank = (route: string) => (order.includes(route) ? order.indexOf(route) : order.length);
  const pages = (await Promise.all(mdx.map((file) => convertPage(file, site)))).toSorted(
    (a, b) => rank(a.route) - rank(b.route) || a.route.localeCompare(b.route),
  );
  const componentPages = await Promise.all(components.map((c) => componentPage(c.name, site)));
  const all = [...pages, ...componentPages].toSorted((a, b) => a.route.localeCompare(b.route));

  await rm(path.join(out, "docs"), { recursive: true, force: true });
  for (const page of all) {
    const file = path.join(out, `${page.route}.md`);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, page.markdown);
  }

  if (registryDocs) await writeRegistryDocs(registryDocs, pages);

  const llms = llmsTxt(pages, componentPages, site);
  if (llms.length > LLMS_LIMIT) {
    throw new Error(`llms.txt is ${llms.length} characters; the limit is ${LLMS_LIMIT}.`);
  }
  const llmsFull = `${llms}\n${all.map((page) => `\n---\n\n${page.markdown}`).join("")}`;
  await writeFile(path.join(out, "llms.txt"), llms);
  await writeFile(path.join(out, "llms-full.txt"), llmsFull);
  return { pages: all, llms, llmsFull };
}

/** `/docs/installation/vite` is the topic `installation-vite`. */
export const topicName = (route: string) => route.replace(/^\/docs\//, "").replaceAll("/", "-");

async function writeRegistryDocs(dir: string, pages: DocPage[]): Promise<void> {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const topics = pages.map((page) => ({
    topic: topicName(page.route),
    title: page.title,
    description: page.description,
    path: `${topicName(page.route)}.md`,
  }));
  for (const page of pages) {
    await writeFile(path.join(dir, `${topicName(page.route)}.md`), page.markdown);
  }
  await writeFile(path.join(dir, "index.json"), `${JSON.stringify({ topics }, null, 2)}\n`);
}

interface MdxFile {
  route: string;
  source: string;
}

async function readMdxPages(dir: string): Promise<MdxFile[]> {
  const found: MdxFile[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || entry.name !== "page.mdx") continue;
    const folder = path.relative(path.join(ROOT, "src/app/(site)"), entry.parentPath);
    found.push({
      route: `/${folder.split(path.sep).join("/")}`,
      source: await readFile(path.join(entry.parentPath, entry.name), "utf8"),
    });
  }
  return found;
}

function field(source: string, name: string): string {
  const match = new RegExp(`${name}:\\s*"((?:[^"\\\\]|\\\\.)*)"`).exec(source);
  if (!match?.[1]) throw new Error(`A page.mdx has no ${name} in its metadata.`);
  return match[1];
}

async function convertPage(file: MdxFile, site: string): Promise<DocPage> {
  const title = field(file.source, "title");
  const description = field(file.source, "description");
  const body = await toMarkdown(file.source, { title, description, site });
  return { route: file.route, title, description, markdown: `${body.trim()}\n` };
}

/**
 * Turns a page's MDX into Markdown. Pages are Markdown with a few components, so this replaces
 * each of them: PageHeader, Command, File, Diagram, and imported partials.
 */
async function toMarkdown(
  source: string,
  context: { title: string; description: string; site: string },
): Promise<string> {
  const partials = new Map<string, string>();
  for (const match of source.matchAll(
    /^import (\w+) from "@\/docs\/partials\/([\w-]+)\.mdx";$/gm,
  )) {
    const [, name, file] = match;
    if (!name || !file) continue;
    const partial = await readFile(path.join(ROOT, `src/docs/partials/${file}.mdx`), "utf8");
    partials.set(name, await toMarkdown(partial, context));
  }

  let text = source
    // Imports are only at the top; a code block may contain its own.
    .replace(/^(?:import .*;\n|\n)+/, "")
    .replace(/^export const metadata = \{[\s\S]*?^\};$/m, "")
    .replace(/<PageHeader[^>]*\/>/, `# ${context.title}\n\n${context.description}`);

  for (const [name, markdown] of partials) text = text.replace(`<${name} />`, markdown);

  text = text
    .replaceAll(/<Command packages=\{\[([^\]]*)\]\}( dev)? \/>/g, (_, list: string, dev) => {
      const packages = [...list.matchAll(/"([^"]+)"/g)].map((m) => m[1]).join(" ");
      return `\`\`\`bash\nnpm install${dev ? " -D" : ""} ${packages}\n\`\`\``;
    })
    .replaceAll(
      /<Command args="([^"]+)" \/>/g,
      (_, args: string) => `\`\`\`bash\nnpx shelf ${args}\n\`\`\``,
    )
    .replaceAll(
      /<File name="([^"]+)">\s*([\s\S]*?)\s*<\/File>/g,
      (_, name: string, block: string) => `\`${name}\`:\n\n${block}`,
    )
    .replaceAll(
      /<Diagram title=\{(\w+)\.title\} label=\{\w+\.label\}>\s*\{(\w+)\.art\}\s*<\/Diagram>/g,
      (_, _title: string, name: string) => {
        const diagram = Object.entries(diagrams).find(([key]) => key === name)?.[1];
        if (!diagram) throw new Error(`No diagram named ${name} in src/docs/diagrams.ts`);
        return `${diagram.label}\n\n\`\`\`text\n${diagram.art.replaceAll("**", "").trim()}\n\`\`\``;
      },
    )
    // Site paths become absolute links to the Markdown page, which agents can fetch.
    .replaceAll(/\]\((\/docs\/[^)#]*)(#[^)]*)?\)/g, (_, href: string, hash = "") => {
      return `](${context.site}${href.replace(/\/$/, "")}.md${hash})`;
    })
    .replaceAll(/\n{3,}/g, "\n\n");

  const leftover = /<(PageHeader|Command|File|Diagram|[A-Z]\w+)[ >]/.exec(
    text.replaceAll(/```[\s\S]*?```/g, ""),
  );
  if (leftover) throw new Error(`Unconverted component <${leftover[1]}> in ${context.title}`);
  return text;
}

const fence = (code: string, lang = "tsx") => `\`\`\`${lang}\n${code.trimEnd()}\n\`\`\``;

async function componentPage(name: string, site: string): Promise<DocPage> {
  const component = components.find((c) => c.name === name);
  if (!component) throw new Error(`No component ${name}`);
  const [files, dependencies, demo] = await Promise.all([
    installedFiles(name),
    installedDependencies(name),
    readDemo(`${name}.tsx`),
  ]);
  const main = files.find((file) => file.path.endsWith(`/${name}.tsx`)) ?? files[0];
  const usage = main && usageExample(main);

  const lines = [
    `# ${component.title}`,
    "",
    component.description,
    "",
    "## When to use",
    "",
    `- Use when: ${component.useWhen}`,
    `- Avoid when: ${component.avoidWhen}`,
    "",
    "## Installation",
    "",
    fence(`npx shelf add ${name}`, "bash"),
    "",
    `The source lands in \`${main?.path}\`, along with any Shelf items it builds on, and \`.shelf/lock.json\` records what was installed. It is yours to edit.`,
  ];
  if (usage) lines.push("", "## Usage", "", fence(usage));
  lines.push("", "## Example", "", fence(demo));
  for (const example of component.examples ?? []) {
    lines.push("", `### ${example.title}`, "");
    if (example.description) lines.push(example.description, "");
    lines.push(fence(await readDemo(`examples/${name}-${example.name}.tsx`)));
  }
  lines.push("", "## Built on", "");
  lines.push(
    `- Packages: ${dependencies.packages.length ? dependencies.packages.map((d) => `\`${d}\``).join(", ") : "none"}`,
  );
  lines.push(
    `- Shelf items: ${dependencies.shelf.length ? dependencies.shelf.map((d) => `[${d}](${site}/docs/components/${d}.md)`).join(", ") : "none"}`,
  );
  if (dependencies.packages.includes("@base-ui/react")) {
    const page = name in BASE_UI_PAGE ? BASE_UI_PAGE[name] : name;
    lines.push(
      "- Accessibility: focus, keyboard, and ARIA behavior come from Base UI.",
      ...(page ? [`- Base UI API reference: https://base-ui.com/react/components/${page}.md`] : []),
    );
  }
  return {
    route: `/docs/components/${name}`,
    title: component.title,
    description: component.description,
    markdown: `${lines.join("\n")}\n`,
  };
}

async function readDemo(file: string): Promise<string> {
  const source = await readFile(path.join(ROOT, "src/demos", file), "utf8");
  return source.replace(/^"use client";\n\n/, "");
}

function llmsTxt(pages: DocPage[], componentPages: DocPage[], site: string): string {
  const entry = (page: DocPage) =>
    `- [${page.title}](${site}${page.route}.md): ${page.description}`;
  const charts = componentPages.filter(
    (page) =>
      components.find((c) => `/docs/components/${c.name}` === page.route)?.group === "charts",
  );
  const plain = componentPages.filter((page) => !charts.includes(page));
  return [
    "# Shelf",
    "",
    `> ${siteConfig.lead}`,
    "",
    "Shelf is a design system that installs as source: `shelf add` copies normal React and StyleX files into your project and records what it installed, so you can change them and still update. Every link below is Markdown. Append `.md` to any docs URL for its Markdown. Start with Installation.",
    "",
    "## Docs",
    "",
    ...pages.map(entry),
    "",
    "## Components",
    "",
    ...plain.map(entry),
    "",
    "## Charts",
    "",
    ...charts.map(entry),
    "",
    "## Registry",
    "",
    `- [Shelf Registry index](${siteConfig.registryUrl}llms.txt): every item the registry publishes, with its files and dependencies.`,
    "",
  ].join("\n");
}

if (import.meta.main) {
  const site = siteConfig.url;
  const { pages, llms } = await buildAgentDocs({
    out: path.join(ROOT, "public"),
    site,
    registryDocs: path.join(ROOT, "../../registry/docs"),
  });
  console.log(
    `✓ wrote ${pages.length} Markdown pages, llms.txt (${llms.length} characters), llms-full.txt`,
  );
}
