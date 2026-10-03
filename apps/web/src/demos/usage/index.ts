import type {
  RegistryEntry,
  RevisionHistory,
  UsageGraph,
} from "@/components/blocks/usage-explorer";
import acme from "./acme.json";

/**
 * A snapshot of `shelf usage` over `examples/acme` with the registry's history. Checked in,
 * so the page renders the same on every build.
 */
export interface UsageSnapshot {
  generatedAt: string;
  usage: UsageGraph;
  items: RegistryEntry[];
  history: RevisionHistory;
}

const json: unknown = acme;
// JSON imports widen string unions like `registry: "this"` to string.
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
export const acmeUsage = json as UsageSnapshot;
