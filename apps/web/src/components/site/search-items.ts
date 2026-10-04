import { blocks } from "@/docs/blocks";
import { components } from "@/docs/components";
import { docGroups } from "@/docs/pages";

export type SearchKind = "page" | "component" | "block";

export interface SearchItem {
  /** Unique: the href. */
  value: string;
  label: string;
  href: string;
  kind: SearchKind;
  /** A line under the title. */
  description?: string;
  /** Extra words that find this item, such as the section it belongs to. */
  keywords: string;
}

export interface SearchGroup {
  value: string;
  items: SearchItem[];
}

/** Pages already listed under their own kind; the "All …" index links would only repeat them. */
const INDEX_HREFS = new Set(["/docs/components", "/blocks"]);

const pages: SearchItem[] = docGroups.flatMap((group) =>
  group.links
    .filter((link) => !INDEX_HREFS.has(link.href))
    .map((link) => ({
      value: link.href,
      label: link.title,
      href: link.href,
      kind: "page" as const,
      keywords: group.title,
    })),
);

const componentItems = (charts: boolean): SearchItem[] =>
  components
    .filter((component) => (component.group === "charts") === charts)
    .map((component) => ({
      value: `/docs/components/${component.name}`,
      label: component.title,
      href: `/docs/components/${component.name}`,
      kind: "component" as const,
      description: component.description,
      keywords: `${component.name} ${component.useWhen}`,
    }));

const blockItems: SearchItem[] = blocks.map((block) => ({
  value: `/blocks/${block.categories[0]}#${block.name}`,
  label: block.title,
  href: `/blocks/${block.categories[0]}#${block.name}`,
  kind: "block" as const,
  description: block.description,
  keywords: `${block.name} ${block.categories.join(" ")}`,
}));

export const searchGroups: SearchGroup[] = [
  { value: "Pages", items: pages },
  { value: "Components", items: componentItems(false) },
  { value: "Charts", items: componentItems(true) },
  { value: "Blocks", items: blockItems },
];

/** Every word typed must appear in the title, the description, or the keywords. */
export function matchesSearch(item: SearchItem, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = `${item.label} ${item.description ?? ""} ${item.keywords}`.toLowerCase();
  return words.every((word) => haystack.includes(word));
}

/** Title matches first, so "dialog" lists Dialog before things that merely mention it. */
export function rankSearch(items: SearchItem[], query: string): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  const score = (item: SearchItem) => {
    const label = item.label.toLowerCase();
    if (label === q) return 0;
    if (label.startsWith(q)) return 1;
    if (label.includes(q)) return 2;
    return 3;
  };
  return items.toSorted((a, b) => score(a) - score(b));
}

/** Groups with only the matching, ranked items; empty groups are dropped. */
export function searchFor(query: string): SearchGroup[] {
  if (!query.trim()) return searchGroups;
  return searchGroups
    .map((group) => ({
      value: group.value,
      items: rankSearch(
        group.items.filter((item) => matchesSearch(item, query)),
        query,
      ),
    }))
    .filter((group) => group.items.length > 0);
}
