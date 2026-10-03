import { Badge, type BadgeVariant } from "@/components/ui/badge";
import type { InstalledItem, ItemState } from "@/data";
import { itemState } from "@/data";

const STATE_LABEL: Record<ItemState, string> = {
  current: "Up to date",
  update: "Update available",
  modified: "Modified",
  other: "Other registry",
  unused: "Not imported",
  consumed: "Used via a package",
};

const VARIANT: Record<ItemState, BadgeVariant> = {
  current: "secondary",
  update: "default",
  modified: "outline",
  other: "outline",
  unused: "outline",
  consumed: "secondary",
};

export function StateBadge({ state }: { state: ItemState }) {
  return <Badge variant={VARIANT[state]}>{STATE_LABEL[state]}</Badge>;
}

/** The CLI arguments that resolve an installed item's state, run in the project directory. */
export function fixArgs(name: string, item: InstalledItem): string | null {
  const state = itemState(item);
  if (state === "update") return `update ${name}`;
  if (state === "modified") return `diff ${name} --local`;
  return null;
}
