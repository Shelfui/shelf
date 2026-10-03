import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Baseline, Size, Weight } from "./types";

export const baselineFile = path.join(import.meta.dirname, "baseline.json");

/** An item may grow by this much before the check fails, but only past `MIN_GROWTH` bytes. */
const MAX_GROWTH = 0.1;
const MIN_GROWTH = 300;

const bytes = (weight: Weight) => weight.js + weight.css;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function readBaseline(): Promise<Baseline> {
  try {
    const parsed: unknown = JSON.parse(await readFile(baselineFile, "utf8"));
    const items: Baseline["items"] = {};
    if (isRecord(parsed) && isRecord(parsed["items"])) {
      for (const [name, entry] of Object.entries(parsed["items"])) {
        if (
          isRecord(entry) &&
          typeof entry["own"] === "number" &&
          typeof entry["total"] === "number"
        ) {
          items[name] = { own: entry["own"], total: entry["total"] };
        }
      }
    }
    return { items };
  } catch {
    return { items: {} };
  }
}

export async function writeBaseline(sizes: Record<string, Size>) {
  const items: Baseline["items"] = {};
  for (const name of Object.keys(sizes).toSorted()) {
    const size = sizes[name];
    if (size) items[name] = { own: bytes(size.own), total: bytes(size.total) };
  }
  await writeFile(baselineFile, `${JSON.stringify({ items }, null, 2)}\n`);
}

/** What is wrong with `sizes` against the committed baseline. Empty when it is within budget. */
export function compareToBaseline(sizes: Record<string, Size>, baseline: Baseline): string[] {
  const problems: string[] = [];
  for (const [name, size] of Object.entries(sizes)) {
    const budget = baseline.items[name];
    if (!budget) {
      problems.push(`${name}: no size baseline yet.`);
      continue;
    }
    for (const kind of ["own", "total"] as const) {
      const now = bytes(size[kind]);
      const limit = budget[kind];
      const growth = now - limit;
      if (growth > MIN_GROWTH && growth > limit * MAX_GROWTH) {
        problems.push(`${name}: ${kind} grew from ${limit} to ${now} B gzipped (+${growth} B).`);
      }
    }
  }
  for (const name of Object.keys(baseline.items)) {
    if (!(name in sizes)) problems.push(`${name}: in the baseline but no longer in the registry.`);
  }
  return problems;
}
