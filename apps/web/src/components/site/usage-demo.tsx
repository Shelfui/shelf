"use client";

import { UsageExplorer } from "@/components/blocks/usage-explorer";
import type { UsageSnapshot } from "@/demos/usage";
import { runCommand } from "@/lib/package-manager";
import { usePackageManager } from "./use-package-manager";

/** The usage explorer on a checked-in snapshot, linking items to their docs. */
export function UsageDemo({
  snapshot,
  documented,
}: {
  snapshot: UsageSnapshot;
  /** Items with a page under /docs/components. */
  documented: string[];
}) {
  const [pm] = usePackageManager();
  return (
    <UsageExplorer
      usage={snapshot.usage}
      items={snapshot.items}
      history={snapshot.history}
      now={Date.parse(snapshot.generatedAt)}
      runner={runCommand(pm, "").trim()}
      hrefs={{
        item: (name) => (documented.includes(name) ? `/docs/components/${name}` : ""),
      }}
    />
  );
}
