import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { Item } from "./items";

export interface StoryFacts {
  stories: { total: number; interactive: number };
  /** Storybook's id for the item's first story, such as `components-button--default`. */
  storyId: string | null;
  providesContext: boolean;
  renderTested: boolean;
}

/**
 * A context whose value is an object, so a new object on every render re-renders every consumer.
 * Contexts that hold a string or number have nothing to memoize.
 */
const OBJECT_CONTEXT = /\bcreateContext\s*(?:<[^()]*>)?\(\s*(?:null|undefined|\{|\[)/;

const count = (text: string, pattern: RegExp) => text.match(pattern)?.length ?? 0;

const kebab = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Storybook's id for the first story in a file: the title and the export name, kebab-cased. */
function firstStoryId(text: string): string | null {
  const title = text.match(/\btitle:\s*"([^"]+)"/)?.[1];
  const story = text.match(/export const (\w+) = \w+\.story\(/)?.[1];
  if (!title || !story) return null;
  // Storybook splits an export name's words (`WithLegend`) but not a title's (`NativeSelect`).
  return `${kebab(title)}--${kebab(story.replace(/([a-z0-9])([A-Z])/g, "$1-$2"))}`;
}

/**
 * Reads the item's folder: its stories (and how many have a play function), whether the item
 * creates a React context, and whether a `*.perf.tsx` render test sits beside it. Accessibility
 * is not read here: `bun run check` runs axe on every story, so every story counts.
 */
export async function readStoryFacts(item: Item): Promise<StoryFacts> {
  const names = await readdir(item.dir);
  const facts: StoryFacts = {
    stories: { total: 0, interactive: 0 },
    storyId: null,
    providesContext: false,
    renderTested: names.some((name) => name.endsWith(".perf.tsx")),
  };
  for (const name of names.filter((entry) => entry.endsWith(".stories.tsx"))) {
    const text = await readFile(path.join(item.dir, name), "utf8");
    facts.storyId ??= firstStoryId(text);
    facts.stories.total += count(text, /\.story\(/g);
    facts.stories.interactive += count(text, /^\s*play\s*[:(]/gm);
  }
  for (const file of item.files) {
    if (!/\.tsx?$/.test(file)) continue;
    if (OBJECT_CONTEXT.test(await readFile(file, "utf8"))) facts.providesContext = true;
  }
  return facts;
}
