import { ShelfError } from "./errors";
import { type IndexEntry, type Registry, type RegistryItem, loadItem } from "./registry";

/**
 * Loads the requested items and their Shelf dependencies, dependencies first.
 * Each item appears once, however many times it is requested or depended on.
 */
export async function resolveItems(
  registry: Registry,
  index: IndexEntry[],
  names: string[],
): Promise<RegistryItem[]> {
  const entries = new Map(index.map((entry) => [entry.name, entry]));
  const resolved = new Map<string, RegistryItem>();
  const stack: string[] = [];

  async function visit(name: string, requiredBy?: string): Promise<void> {
    if (resolved.has(name)) return;
    if (stack.includes(name)) {
      const cycle = [...stack.slice(stack.indexOf(name)), name].join(" -> ");
      throw new ShelfError(
        `Shelf dependency cycle: ${cycle}. Fix shelfDependencies in the registry.`,
      );
    }
    const entry = entries.get(name);
    if (!entry) throw unknownItem(name, [...entries.keys()], requiredBy);

    stack.push(name);
    const item = await loadItem(registry, entry);
    for (const dependency of item.shelfDependencies) await visit(dependency, name);
    stack.pop();
    resolved.set(name, item);
  }

  for (const name of new Set(names)) await visit(name);
  return [...resolved.values()];
}

function unknownItem(name: string, available: string[], requiredBy?: string): ShelfError {
  if (requiredBy) {
    return new ShelfError(
      `Registry item "${requiredBy}" depends on "${name}", which is not in the registry index.`,
    );
  }
  const suggestion = closestMatch(name, available);
  const hint = suggestion
    ? `Did you mean "${suggestion}"?`
    : `Available: ${available.toSorted().join(", ")}. Run: shelf search`;
  return new ShelfError(`Unknown Shelf item "${name}". ${hint}`);
}

function closestMatch(input: string, candidates: string[]): string | undefined {
  let best: { name: string; distance: number } | undefined;
  for (const candidate of candidates) {
    const distance =
      candidate.startsWith(input) || input.startsWith(candidate)
        ? 1
        : levenshtein(input, candidate);
    if (
      distance <= Math.max(2, Math.floor(candidate.length / 3)) &&
      (!best || distance < best.distance)
    ) {
      best = { name: candidate, distance };
    }
  }
  return best?.name;
}

function levenshtein(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1]! + 1, previous[j]! + 1, previous[j - 1]! + cost);
    }
    previous = current;
  }
  return previous[b.length]!;
}
