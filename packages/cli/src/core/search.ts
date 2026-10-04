import { readConfig, resolveRegistryLocation } from "./config";
import { compareText } from "./format";
import type { Output } from "./output";
import {
  type IndexEntry,
  type ItemType,
  loadIndex,
  openRegistry,
  projectRegistry,
} from "./registry";

export interface SearchOptions {
  cwd: string;
  query: string;
  registry: string | undefined;
  json?: boolean;
  out: Output;
}

/** A tiebreaker: higher-level items come first, as agents should prefer them. */
const TYPE_BONUS: Record<ItemType, number> = {
  template: 3,
  block: 2,
  pattern: 1,
  component: 0,
  foundation: 0,
  lib: 0,
};

function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** "confirm" and "confirmation", "dialog" and "dialogs": one is the start of the other. */
function sameStem(a: string, b: string): boolean {
  return a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a));
}

function bestMatch(term: string, candidates: string[], exact: number, stem: number): number {
  if (candidates.includes(term)) return exact;
  return candidates.some((word) => sameStem(term, word)) ? stem : 0;
}

/** How well one term matches an entry. 0 means it doesn't. */
function termScore(term: string, entry: IndexEntry): number {
  const name = words(entry.name);
  let score = 0;
  if (entry.name === term) score = 120;
  else if (name.includes(term)) score = 100;
  else if (entry.name.includes(term)) score = 60;
  else if (name.some((word) => sameStem(term, word))) score = 50;
  score = Math.max(
    score,
    bestMatch(term, entry.keywords?.flatMap(words) ?? [], 40, 30),
    bestMatch(term, words(entry.useWhen ?? ""), 12, 9),
    bestMatch(term, words(entry.description), 10, 8),
    bestMatch(term, words(entry.type), 5, 0),
  );
  return score;
}

/**
 * The entries that match every term, best first: a name match beats a keyword, a keyword
 * beats the description and use notes, and higher-level items win ties.
 */
export function rankEntries(index: IndexEntry[], query: string): IndexEntry[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const ranked: Array<{ entry: IndexEntry; score: number }> = [];
  for (const entry of index) {
    const scores = terms.map((term) => termScore(term, entry));
    if (scores.some((score) => score === 0)) continue;
    ranked.push({
      entry,
      score: scores.reduce((sum, score) => sum + score, 0) + TYPE_BONUS[entry.type],
    });
  }
  return ranked
    .toSorted((a, b) => b.score - a.score || compareText(a.entry.name, b.entry.name))
    .map(({ entry }) => entry);
}

export async function search({ cwd, query, registry, json, out }: SearchOptions): Promise<void> {
  const source = registry
    ? openRegistry(resolveRegistryLocation(registry, cwd))
    : await projectRegistry(await readConfig(cwd), cwd);
  const matches = rankEntries(await loadIndex(source), query);

  if (json) {
    const items = matches.map(({ name, type, description, status, useWhen, avoidWhen, related }) => ({
      name,
      type,
      description,
      ...(status && { status }),
      ...(useWhen !== undefined && { useWhen }),
      ...(avoidWhen !== undefined && { avoidWhen }),
      ...(related && { related }),
    }));
    out.log(JSON.stringify({ query, items }, null, 2));
    return;
  }
  if (matches.length === 0) {
    out.log(`No Shelf items match "${query}".`);
    return;
  }
  const width = Math.max(...matches.map((entry) => entry.name.length));
  for (const entry of matches) {
    out.log(`${entry.name.padEnd(width)}  ${entry.type.padEnd(10)}  ${entry.status ? "[experimental] " : ""}${entry.description}`);
  }
}
