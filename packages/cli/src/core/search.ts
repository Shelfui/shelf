import { readConfig, resolveRegistryLocation } from "./config";
import type { Output } from "./output";
import { loadIndex, openRegistry, projectRegistry } from "./registry";
import { compareText } from "./format";

export interface SearchOptions {
  cwd: string;
  query: string;
  registry: string | undefined;
  json?: boolean;
  out: Output;
}

export async function search({ cwd, query, registry, json, out }: SearchOptions): Promise<void> {
  const source = registry
    ? openRegistry(resolveRegistryLocation(registry, cwd))
    : await projectRegistry(await readConfig(cwd), cwd);
  const index = await loadIndex(source);
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = index
    .filter((entry) => {
      const haystack = `${entry.name} ${entry.type} ${entry.description}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    })
    .toSorted((a, b) => compareText(a.name, b.name));

  if (json) {
    const items = matches.map(({ name, type, description }) => ({ name, type, description }));
    out.log(JSON.stringify({ query, items }, null, 2));
    return;
  }
  if (matches.length === 0) {
    out.log(`No Shelf items match "${query}".`);
    return;
  }
  const width = Math.max(...matches.map((entry) => entry.name.length));
  for (const entry of matches) {
    out.log(`${entry.name.padEnd(width)}  ${entry.type.padEnd(10)}  ${entry.description}`);
  }
}
