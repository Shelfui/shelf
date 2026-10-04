import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { loadItems, registryDir, repoRoot, type Item } from "./items";

const USAGE = `Usage: bun run audit [--write]

Checks every component against the bar for being stable, and prints what fails.
Items marked "status": "experimental" in registry/index.json are reported but never fail.

  --write   Also write the result to dist/audit.json and apps/web/src/docs/audit.json.
`;

const { values } = parseArgs({
  options: {
    write: { type: "boolean", default: false },
    help: { type: "boolean", default: false },
  },
});
if (values.help) {
  process.stdout.write(USAGE);
  process.exit(0);
}

/** Items that open a layer, move focus, or navigate with arrow keys. Their stories must prove it. */
const KEYBOARD_ITEMS = [
  "alert-dialog",
  "autocomplete",
  "combobox",
  "command",
  "context-menu",
  "date-picker",
  "dialog",
  "drawer",
  "dropdown-menu",
  "hover-card",
  "menubar",
  "navigation-menu",
  "popover",
  "select",
  "tabs",
  "toast",
  "tooltip",
];

/**
 * Components that are not in the Figma library on purpose, and why. Everything else must have
 * `parameters.figma` in its stories.
 */
const FIGMA_EXEMPT: Record<string, string> = {
  icons: "Icons are captured as their own page, not as a component set.",
  composer: "Chat surfaces with streaming and rich text have no useful static variants.",
  thread: "Scroll and streaming behavior has no static Figma equivalent.",
  message: "Composed inside the chat blocks, which designers get as a whole.",
  stream: "Animation primitives with no static visual states.",
  shimmer: "Animation primitive with no static visual state.",
  "number-ticker": "Animation primitive with no static visual state.",
  reasoning: "Streaming chat part; designers use the chat block.",
  "tool-call": "Streaming chat part; designers use the chat block.",
  approval: "Streaming chat part; designers use the chat block.",
  plan: "Streaming chat part; designers use the chat block.",
  sources: "Chat part; designers use the chat block.",
  citation: "Chat part; designers use the chat block.",
  attachment: "Chat part; designers use the chat block.",
  "copy-button": "Behavior wrapper over Button, which is already in the library.",
  dropzone: "Drag-and-drop behavior; the idle state is a plain box.",
  rating: "Interaction-driven; the states are the same star icon.",
  "color-picker": "Canvas-based picker with no native Figma equivalent.",
  "time-picker": "Composed from Select and Input, which are already in the library.",
  "tree-view": "Open-ended data shape; designers compose from Item.",
  "code-block": "Syntax highlighting is code-specific; designers use a text style.",
  editor: "Rich-text engine; no static variants.",
  "editor-block-handle": "Editor internals.",
  "editor-bubble-menu": "Editor internals.",
  "editor-link-popover": "Editor internals.",
  "editor-slash-menu": "Editor internals.",
  "editor-suggestion": "Editor internals.",
};

/** Components that have no stories of their own because other items' stories exercise them. */
const NO_STORIES: Record<string, string> = {
  chart: "Shared parts for the chart-* items, whose stories exercise it.",
};

/** Items that match a hand-rolled marker on purpose, and why Base UI cannot do the job. */
const HAND_ROLLED_OK: Record<string, string> = {
  composer: "Escape stops a running reply. It does not dismiss a layer.",
  "editor-slash-menu":
    "Focus stays in the editor and the list is driven by aria-activedescendant. Base UI popups take focus.",
  "editor-suggestion":
    "Focus stays in the editor and the list is driven by aria-activedescendant. Base UI popups take focus.",
};

/** Markers of behavior Base UI already provides, in an item that does not use Base UI. */
const HAND_ROLLED = [
  /aria-modal/,
  /role=["'](?:dialog|alertdialog|menu|listbox|combobox)["']/,
  /key\s*===\s*["']Escape["']/,
  /createFocusTrap|focus-trap/,
];

export interface AuditEntry {
  /** `stable` passes every rule. `experimental` is declared in registry/index.json. */
  status: "stable" | "experimental" | "failing";
  problems: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await readFile(file, "utf8"));
}

async function storyText(item: Item): Promise<string> {
  const names = (await readdir(item.dir)).filter((name) => name.endsWith(".stories.tsx"));
  const texts = await Promise.all(names.map((name) => readFile(path.join(item.dir, name), "utf8")));
  return texts.join("\n");
}

async function sourceText(item: Item): Promise<string> {
  const files = item.files.filter((file) => /\.tsx?$/.test(file));
  return (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
}

const index = await readJson(path.join(registryDir, "index.json"));
const entries = isRecord(index) && Array.isArray(index["items"]) ? index["items"] : [];
const meta = new Map<string, Record<string, unknown>>();
for (const entry of entries) {
  if (isRecord(entry) && typeof entry["name"] === "string") meta.set(entry["name"], entry);
}

const verifyCopy = await readJson(path.join(repoRoot, "apps/web/src/docs/verify.json")).catch(
  () => ({}),
);
const verified = isRecord(verifyCopy) && isRecord(verifyCopy["items"]) ? verifyCopy["items"] : {};

const items = (await loadItems()).filter((item) => item.type === "component");
const report: Record<string, AuditEntry> = {};

for (const item of items) {
  const problems: string[] = [];
  const entry = meta.get(item.name);
  const stories = await storyText(item);
  const source = await sourceText(item);
  const usesBaseUi = item.packages.includes("@base-ui/react");
  const facts = verified[item.name];
  const storyFacts = isRecord(facts) && isRecord(facts["stories"]) ? facts["stories"] : undefined;
  const total = typeof storyFacts?.["total"] === "number" ? storyFacts["total"] : 0;
  const interactive =
    typeof storyFacts?.["interactive"] === "number" ? storyFacts["interactive"] : 0;

  if (total === 0) {
    if (!NO_STORIES[item.name]) problems.push("has no stories");
  } else if (interactive === 0) problems.push("no story has a play function");

  if (KEYBOARD_ITEMS.includes(item.name)) {
    if (!/Escape|keyboard\(|\{Arrow|\{Enter|\{Tab/.test(stories)) {
      problems.push("no story drives the keyboard (Escape, arrows, Enter, or Tab)");
    }
    if (!/toHaveFocus|document\.activeElement/.test(stories)) {
      problems.push("no story asserts where focus is");
    }
  }

  if (!usesBaseUi && !HAND_ROLLED_OK[item.name]) {
    const marker = HAND_ROLLED.find((pattern) => pattern.test(source));
    if (marker) {
      problems.push(`hand-rolls interaction behavior (${marker.source}) without Base UI`);
    }
  }

  if (!entry || !Array.isArray(entry["keywords"]) || typeof entry["useWhen"] !== "string") {
    problems.push("registry/index.json entry needs keywords and useWhen");
  }

  const inFigma = /\bfigma\s*:\s*\{/.test(stories);
  if (!inFigma && !FIGMA_EXEMPT[item.name] && !NO_STORIES[item.name]) {
    problems.push("not in the Figma library and no reason in FIGMA_EXEMPT");
  }
  if (inFigma && FIGMA_EXEMPT[item.name]) {
    problems.push("is in the Figma library but listed in FIGMA_EXEMPT");
  }

  const doctor = isRecord(facts) && isRecord(facts["doctor"]) ? facts["doctor"] : undefined;
  if (typeof doctor?.["errors"] === "number" && doctor["errors"] > 0) {
    problems.push(`React Doctor reports ${doctor["errors"]} errors`);
  }

  const experimental = entry?.["status"] === "experimental";
  report[item.name] = {
    status: experimental ? "experimental" : problems.length > 0 ? "failing" : "stable",
    problems,
  };
}

const failing = Object.entries(report).filter(([, value]) => value.status === "failing");
const experimental = Object.entries(report).filter(([, value]) => value.status === "experimental");
const stable = Object.values(report).filter((value) => value.status === "stable").length;

for (const [name, value] of [...failing, ...experimental]) {
  for (const problem of value.problems) {
    process.stdout.write(
      `${name}${value.status === "experimental" ? " (experimental)" : ""}: ${problem}\n`,
    );
  }
}
process.stdout.write(
  `Audited ${items.length} components: ${stable} stable, ${experimental.length} experimental, ${failing.length} failing.\n`,
);

if (values.write) {
  const text = `${JSON.stringify({ version: 1, items: report }, null, 2)}\n`;
  const distFile = path.join(repoRoot, "dist", "audit.json");
  await mkdir(path.dirname(distFile), { recursive: true });
  await writeFile(distFile, text);
  await writeFile(path.join(repoRoot, "apps/web/src/docs/audit.json"), text);
}

if (failing.length > 0) {
  process.stderr.write(
    '\nFix each problem, or mark the item "status": "experimental" in registry/index.json until it is fixed.\n',
  );
  process.exit(1);
}
