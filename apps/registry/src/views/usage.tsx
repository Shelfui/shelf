import * as stylex from "@stylexjs/stylex";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { UsageExplorer } from "@/components/blocks/usage-explorer";
import { type Filters, type InstallState, STATES } from "@/components/blocks/usage-model";
import { useRunner } from "@/components/site/command";
import { PageHeader } from "@/components/site/page-header";
import { layout } from "@/components/site/styles";
import { useRegistry } from "@/data";
import { NotFound } from "@/views/not-found";

export interface UsageSearch {
  q?: string;
  ns?: string;
  state?: string;
}

const isState = (value: string): value is InstallState => STATES.some((state) => state === value);

export function Usage() {
  const registry = useRegistry();
  const search = useSearch({ from: "/usage" });
  const navigate = useNavigate({ from: "/usage" });
  const runner = useRunner();
  const { usage } = registry;
  if (!usage) {
    return (
      <NotFound title="No usage data">
        This registry was built without usage.json. Run shelf usage --json and pass it to shelf
        build registry --usage.
      </NotFound>
    );
  }

  const filters: Filters = {
    query: search.q ?? "",
    namespaces: search.ns?.split(",") ?? [],
    states: search.state?.split(",").filter(isState) ?? [],
  };

  return (
    <div {...stylex.props(layout.stack)}>
      <PageHeader
        title="Usage"
        lead="Where every item is installed, which copies were changed, and how far each one has drifted from this registry."
      />
      <UsageExplorer
        usage={usage}
        items={registry.items}
        history={registry.history}
        hrefs={{
          item: (name) => `#/items/${encodeURIComponent(name)}`,
          project: (id) => `#/projects/${id}`,
        }}
        runner={runner}
        filters={filters}
        onFiltersChange={(next) =>
          void navigate({
            search: {
              ...(next.query && { q: next.query }),
              ...(next.namespaces.length > 0 && { ns: next.namespaces.join(",") }),
              ...(next.states.length > 0 && { state: next.states.join(",") }),
            },
            replace: true,
          })
        }
      />
    </div>
  );
}
