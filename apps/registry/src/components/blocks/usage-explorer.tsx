"use client";

import * as stylex from "@stylexjs/stylex";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import * as Tabs from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { colors, radius, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { ChartTooltip, type Tip } from "./usage-tooltip";
import { Beeswarm, type ChartProps, ItemBars } from "./usage-drift";
import { Flow } from "./usage-flow";
import {
  type Filters,
  type Focus,
  DEFAULT_RUNNER,
  type Install,
  type InstallState,
  NO_FILTERS,
  type RegistryEntry,
  type RevisionHistory,
  STATES,
  STATE_LABELS,
  type UsageGraph,
  applyFilters,
  fixCommand,
  formatAge,
  installs,
  matches,
  summary,
} from "./usage-model";
import { stateFill } from "./usage-palette";
import { Radial } from "./usage-radial";

const NO_HISTORY: RevisionHistory = {};

export interface UsageExplorerProps {
  /** `shelf usage --json` output. */
  usage: UsageGraph;
  /** The registry's `index.json` items. */
  items: RegistryEntry[];
  /** The registry's `history.json`, for how long installs have been behind. */
  history?: RevisionHistory;
  /** Milliseconds. Pass the snapshot's time so server and browser render the same. */
  now?: number;
  /** Links for items and projects in the selection panel. */
  hrefs?: { item?: (name: string) => string; project?: (id: string) => string };
  filters?: Filters;
  onFiltersChange?: (filters: Filters) => void;
  /** How fix commands start, for the reader's package manager. */
  runner?: string;
}

/**
 * Where every registry item is installed, what state each copy is in, and how far behind it
 * has drifted. Hover a mark to highlight it everywhere, click to pin it, Escape to clear.
 */
export function UsageExplorer({
  usage,
  items,
  history = NO_HISTORY,
  now: fixedNow,
  hrefs,
  filters: controlled,
  onFiltersChange,
  runner = DEFAULT_RUNNER,
}: UsageExplorerProps) {
  const [mountedAt] = useState(Date.now);
  const now = fixedNow ?? mountedAt;
  const [uncontrolled, setUncontrolled] = useState(NO_FILTERS);
  const filters = controlled ?? uncontrolled;
  const setFilters = (next: Filters) => {
    if (!controlled) setUncontrolled(next);
    onFiltersChange?.(next);
  };

  const [hovered, setHovered] = useState<Focus>(null);
  const [pinned, setPinned] = useState<Focus>(null);
  const [tip, setTip] = useState<Tip | null>(null);

  const all = useMemo(() => installs(usage, items, history, now), [usage, items, history, now]);
  const rows = useMemo(() => applyFilters(all, filters), [all, filters]);
  const namespaces = useMemo(() => [...new Set(all.map((row) => row.namespace))].toSorted(), [all]);
  const stats = summary(rows, items);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPinned(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const chart: ChartProps = {
    rows,
    namespaces,
    focus: hovered ?? pinned,
    pinned,
    onHover: setHovered,
    onPin: (focus) => {
      setPinned(focus);
      setTip(null);
    },
    onTip: setTip,
    runner,
  };

  return (
    <div {...stylex.props(styles.root)}>
      <dl {...stylex.props(styles.stats)}>
        <Stat
          label="Projects"
          value={stats.projects}
          detail={`in ${plural(stats.namespaces, "namespace")}`}
        />
        <Stat
          label="Items in use"
          value={stats.adopted}
          detail={`of ${stats.available} in the registry`}
        />
        <Stat label="Behind" value={stats.behind} detail="installs with a newer revision" />
        <Stat label="Modified" value={stats.modified} detail="installs changed locally" />
        <Stat label="Not imported" value={stats.unused} detail="installed but unused" />
      </dl>

      <div {...stylex.props(styles.filters)}>
        <div {...stylex.props(styles.search)}>
          <SearchIcon aria-hidden {...stylex.props(styles.searchIcon)} />
          <Input
            type="search"
            aria-label="Filter items and projects"
            placeholder="Filter items and projects"
            value={filters.query}
            onValueChange={(query: string) => setFilters({ ...filters, query })}
            style={styles.searchInput}
          />
        </div>
        <ToggleGroup
          multiple
          aria-label="Namespaces"
          value={filters.namespaces}
          onValueChange={(value: string[]) => setFilters({ ...filters, namespaces: value })}
        >
          {namespaces.map((namespace) => (
            <Toggle key={namespace} value={namespace} size="sm" variant="outline">
              {namespace}
            </Toggle>
          ))}
        </ToggleGroup>
        <ToggleGroup
          multiple
          aria-label="States"
          value={filters.states}
          onValueChange={(value: string[]) =>
            setFilters({ ...filters, states: STATES.filter((state) => value.includes(state)) })
          }
        >
          {STATES.filter((state) => all.some((row) => row.state === state)).map((state) => (
            <Toggle key={state} value={state} size="sm" variant="outline">
              <span aria-hidden {...stylex.props(styles.swatch, stateFill[state])} />
              {STATE_LABELS[state]}
            </Toggle>
          ))}
        </ToggleGroup>
        {(filters.query || filters.namespaces.length > 0 || filters.states.length > 0) && (
          <Button variant="ghost" size="sm" onClick={() => setFilters(NO_FILTERS)}>
            Clear filters
          </Button>
        )}
      </div>

      <Tabs.Root defaultValue="drift">
        <Tabs.List aria-label="View">
          <Tabs.Tab value="drift">Drift</Tabs.Tab>
          <Tabs.Tab value="graph">Graph</Tabs.Tab>
          <Tabs.Tab value="flow">Flow</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="drift" style={styles.panel}>
          {rows.length === 0 ? (
            <Empty />
          ) : (
            <div {...stylex.props(styles.drift)}>
              <Section title="Installs per item">
                <ItemBars {...chart} />
              </Section>
              <Section title="How far behind">
                <Beeswarm {...chart} />
              </Section>
            </div>
          )}
        </Tabs.Panel>
        <Tabs.Panel value="graph" style={styles.panel}>
          {rows.length === 0 ? <Empty /> : <Radial {...chart} />}
        </Tabs.Panel>
        <Tabs.Panel value="flow" style={styles.panel}>
          {rows.length === 0 ? <Empty /> : <Flow {...chart} />}
        </Tabs.Panel>
      </Tabs.Root>

      {pinned && (
        <Selection
          focus={pinned}
          rows={rows.filter((row) => matches(row, pinned))}
          hrefs={hrefs}
          runner={runner}
          onClose={() => setPinned(null)}
        />
      )}

      <ChartTooltip tip={tip} />
    </div>
  );
}

function Stat({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div {...stylex.props(styles.stat)}>
      <dt {...stylex.props(styles.statLabel)}>{label}</dt>
      <dd {...stylex.props(styles.statValue)}>{value}</dd>
      <dd {...stylex.props(styles.statDetail)}>{detail}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} {...stylex.props(styles.section)}>
      <h3 {...stylex.props(styles.sectionTitle)}>{title}</h3>
      {children}
    </section>
  );
}

function Empty() {
  return <p {...stylex.props(styles.empty)}>No installs match these filters.</p>;
}

function Selection({
  focus,
  rows,
  hrefs,
  runner,
  onClose,
}: {
  focus: NonNullable<Focus>;
  rows: Install[];
  hrefs: UsageExplorerProps["hrefs"];
  runner: string;
  onClose: () => void;
}) {
  const isItem = focus.kind === "item";
  const href = isItem ? hrefs?.item?.(focus.id) : hrefs?.project?.(focus.id);
  const counts = STATES.map(
    (state) => [state, rows.filter((row) => row.state === state).length] as const,
  ).filter(([, count]) => count > 0);

  return (
    <section aria-label={`Selected ${focus.kind}: ${focus.id}`} {...stylex.props(styles.selection)}>
      <div {...stylex.props(styles.selectionHeader)}>
        <div {...stylex.props(styles.selectionTitle)}>
          <span {...stylex.props(styles.statLabel)}>{isItem ? "Item" : "Project"}</span>
          <h3 {...stylex.props(styles.selectionName)}>
            {href ? (
              <a href={href} {...stylex.props(styles.link)}>
                {focus.id}
              </a>
            ) : (
              focus.id
            )}
          </h3>
          <span {...stylex.props(styles.statDetail)}>
            {counts
              .map(([state, count]) => `${count} ${STATE_LABELS[state].toLowerCase()}`)
              .join(", ") || "No installs match these filters."}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Clear selection
        </Button>
      </div>
      {rows.length > 0 && (
        <table {...stylex.props(styles.table)}>
          <thead>
            <tr>
              <th {...stylex.props(styles.th)}>{isItem ? "Project" : "Item"}</th>
              <th {...stylex.props(styles.th)}>State</th>
              <th {...stylex.props(styles.th)}>Behind</th>
              <th {...stylex.props(styles.th)}>Fix</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const name = isItem ? row.project : row.item;
              const link = isItem ? hrefs?.project?.(row.project) : hrefs?.item?.(row.item);
              const command = fixCommand(row, runner);
              return (
                <tr key={`${row.project}:${row.item}`}>
                  <td {...stylex.props(styles.td)}>
                    {link ? (
                      <a href={link} {...stylex.props(styles.link)}>
                        {name}
                      </a>
                    ) : (
                      name
                    )}
                  </td>
                  <td {...stylex.props(styles.td)}>
                    <span {...stylex.props(styles.state)}>
                      <span aria-hidden {...stylex.props(styles.swatch, stateFill[row.state])} />
                      {STATE_LABELS[row.state]}
                      {row.provider && ` from ${row.provider}`}
                    </span>
                  </td>
                  <td {...stylex.props(styles.td, styles.muted)}>{behindText(row)}</td>
                  <td {...stylex.props(styles.td)}>
                    {command ? (
                      <code {...stylex.props(styles.code)} title={`Run in ${row.path}`}>
                        {command}
                      </code>
                    ) : (
                      <span {...stylex.props(styles.muted)}>–</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}

function behindText(row: Install): string {
  if (row.revisionsBehind === null) return "–";
  if (row.revisionsBehind === 0) return "Newest";
  const revisions = plural(row.revisionsBehind, "revision");
  return row.daysBehind === null ? revisions : `${revisions}, ${formatAge(row.daysBehind)}`;
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export type { Filters, InstallState, RegistryEntry, RevisionHistory, UsageGraph };

const styles = stylex.create({
  root: {
    gap: spacing["6"],
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  stats: {
    margin: 0,
    gap: spacing["4"],
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))",
  },
  stat: {
    padding: spacing["4"],
    borderRadius: radius.lg,
    gap: spacing["1"],
    backgroundColor: colors.card,
    display: "flex",
    flexDirection: "column",
  },
  statLabel: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightMedium,
  },
  statValue: {
    margin: 0,
    color: colors.foreground,
    fontSize: "1.75rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: typography.fontWeightSemibold,
    letterSpacing: "-0.02em",
  },
  statDetail: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: typography.fontSizeXs,
  },
  filters: {
    gap: spacing["3"],
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  search: {
    flexBasis: "14rem",
    flexGrow: 1,
    position: "relative",
    maxWidth: "20rem",
  },
  searchIcon: {
    color: colors.mutedForeground,
    insetInlineStart: spacing["2.5"],
    pointerEvents: "none",
    position: "absolute",
    transform: "translateY(-50%)",
    height: spacing["4"],
    top: "50%",
    width: spacing["4"],
  },
  searchInput: {
    paddingInlineStart: "2rem",
  },
  swatch: {
    borderRadius: radius.full,
    display: "inline-block",
    flexShrink: 0,
    height: spacing["2"],
    width: spacing["2"],
  },
  panel: {
    paddingTop: spacing["6"],
  },
  drift: {
    gap: spacing["6"],
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 22rem), 1fr))",
  },
  section: {
    gap: spacing["3"],
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  sectionTitle: {
    margin: 0,
    color: colors.foreground,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
  },
  empty: {
    margin: 0,
    paddingBlock: spacing["6"],
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
    textAlign: "center",
  },
  selection: {
    padding: spacing["4"],
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    gap: spacing["4"],
    display: "flex",
    flexDirection: "column",
  },
  selectionHeader: {
    gap: spacing["4"],
    alignItems: "flex-start",
    display: "flex",
    justifyContent: "space-between",
  },
  selectionTitle: {
    gap: spacing["1"],
    display: "flex",
    flexDirection: "column",
  },
  selectionName: {
    margin: 0,
    color: colors.foreground,
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
  },
  link: {
    textDecoration: { default: "none", ":hover": "underline" },
    color: "inherit",
    textUnderlineOffset: "0.2em",
  },
  table: {
    borderCollapse: "collapse",
    fontSize: typography.fontSizeSm,
    width: "100%",
  },
  th: {
    paddingBlock: spacing["2"],
    color: colors.mutedForeground,
    fontWeight: typography.fontWeightMedium,
    paddingInlineEnd: spacing["4"],
    textAlign: "start",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  },
  td: {
    paddingBlock: spacing["2"],
    color: colors.foreground,
    paddingInlineEnd: spacing["4"],
    verticalAlign: "top",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  },
  state: {
    gap: spacing["1.5"],
    alignItems: "center",
    display: "inline-flex",
  },
  muted: {
    color: colors.mutedForeground,
  },
  code: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
  },
});
