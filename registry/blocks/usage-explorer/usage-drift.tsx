"use client";

import * as stylex from "@stylexjs/stylex";
import { forceCollide, forceSimulation, forceX, forceY } from "d3-force";
import { scaleLinear, scaleSqrt } from "d3-scale";
import { useMemo, useState } from "react";
import { Button } from "../../components/button/button";
import { Toggle } from "../../components/toggle/toggle";
import { ToggleGroup } from "../../components/toggle-group/toggle-group";
import { colors, motion, radius, spacing, typography } from "../../foundations/tokens.stylex";
import { media } from "../../foundations/conditions.stylex";
import type { Tip } from "./usage-tooltip";
import {
  type Focus,
  type Install,
  STATES,
  STATE_LABELS,
  fixCommand,
  formatAge,
  itemBars,
  matches,
  sameFocus,
} from "./usage-model";
import { groupFill, groupIndex, stateFill } from "./usage-palette";
import { useWidth } from "./usage-size";

export interface ChartProps {
  rows: Install[];
  namespaces: string[];
  focus: Focus;
  pinned: Focus;
  onHover: (focus: Focus) => void;
  onPin: (focus: Focus) => void;
  onTip: (tip: Tip | null) => void;
  /** How fix commands start, such as `npx @shelfui/cli`. */
  runner: string;
}

const COLLAPSED = 10;

/** Installs per item as stacked bars, most used first. */
export function ItemBars({ rows, focus, pinned, onHover, onPin }: ChartProps) {
  const [expanded, setExpanded] = useState(false);
  const bars = itemBars(rows);
  const max = bars[0]?.total ?? 1;
  const shown = expanded ? bars : bars.slice(0, COLLAPSED);

  return (
    <div {...stylex.props(styles.bars)}>
      <ol aria-label="Installs per item" {...stylex.props(styles.list)}>
        {shown.map((bar) => {
          const self = { kind: "item", id: bar.item } as const;
          const parts = STATES.filter((state) => bar.counts[state] > 0)
            .map((state) => `${bar.counts[state]} ${STATE_LABELS[state].toLowerCase()}`)
            .join(", ");
          return (
            <li key={bar.item}>
              <button
                type="button"
                aria-pressed={sameFocus(pinned, self)}
                aria-label={`${bar.item}: in ${bar.total} project${bar.total === 1 ? "" : "s"}; ${parts}`}
                onPointerEnter={() => onHover(self)}
                onPointerLeave={() => onHover(null)}
                onFocus={() => onHover(self)}
                onBlur={() => onHover(null)}
                onClick={() => onPin(sameFocus(pinned, self) ? null : self)}
                {...stylex.props(
                  styles.bar,
                  focus && !sameFocus(focus, self) && styles.barMuted,
                  sameFocus(pinned, self) && styles.barPinned,
                )}
              >
                <span {...stylex.props(styles.barLabel)}>{bar.item}</span>
                <span
                  {...stylex.props(styles.track, focus && !sameFocus(focus, self) && styles.dimmed)}
                >
                  <span
                    {...stylex.props(styles.fill, dynamic.width(`${(bar.total / max) * 100}%`))}
                  >
                    {STATES.filter((state) => bar.counts[state] > 0).map((state) => (
                      <span
                        key={state}
                        {...stylex.props(
                          styles.segment,
                          stateFill[state],
                          dynamic.grow(bar.counts[state]),
                        )}
                      />
                    ))}
                  </span>
                </span>
                <span {...stylex.props(styles.barCount)}>{bar.total}</span>
              </button>
            </li>
          );
        })}
      </ol>
      {bars.length > COLLAPSED && (
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Show fewer" : `Show all ${bars.length} items`}
        </Button>
      )}
    </div>
  );
}

type Axis = "revisions" | "age";

const HEIGHT = 240;
const MARGIN = { top: 16, right: 16, bottom: 32, left: 16 };
const DOT = 5;

/** Every install that is behind, placed by how far behind it is and packed so none overlap. */
export function Beeswarm({
  rows,
  namespaces,
  focus,
  pinned,
  onHover,
  onPin,
  onTip,
  runner,
}: ChartProps) {
  const [ref, width] = useWidth<HTMLDivElement>(560);
  const [axis, setAxis] = useState<Axis>("revisions");
  const behind = rows.filter((row) => row.state !== "package" && (row.revisionsBehind ?? 0) > 0);

  const { dots, ticks } = useMemo(() => {
    const value = (row: Install) =>
      axis === "revisions" ? (row.revisionsBehind ?? 0) : (row.daysBehind ?? 0);
    const max = Math.max(1, ...behind.map(value));
    const scale = (axis === "revisions" ? scaleLinear() : scaleSqrt())
      .domain([0, max])
      .range([MARGIN.left + DOT, width - MARGIN.right - DOT])
      .nice();
    const nodes = behind.map((row) => ({ row, x: scale(value(row)), y: HEIGHT / 2 }));
    const middle = (HEIGHT - MARGIN.bottom + MARGIN.top) / 2;
    const simulation = forceSimulation(nodes)
      .force("x", forceX<(typeof nodes)[number]>((node) => scale(value(node.row))).strength(1))
      .force("y", forceY(middle).strength(0.06))
      .force("collide", forceCollide(DOT + 1.5))
      .stop();
    for (let i = 0; i < 240; i++) simulation.tick();
    const top = MARGIN.top + DOT;
    const bottom = HEIGHT - MARGIN.bottom - DOT;
    return {
      dots: nodes.map((node) => ({
        row: node.row,
        x: node.x,
        y: Math.min(bottom, Math.max(top, node.y)),
      })),
      ticks: scale
        .ticks(axis === "revisions" ? Math.min(max, 6) : 5)
        .filter((tick) => axis === "age" || Number.isInteger(tick))
        .map((tick) => ({
          x: scale(tick),
          label: axis === "revisions" ? String(tick) : tick === 0 ? "0" : formatAge(tick),
        })),
    };
    // `behind` is derived from `rows`.
    // oxlint-disable-next-line react/exhaustive-deps
  }, [rows, axis, width]);

  return (
    <div {...stylex.props(styles.swarm)}>
      <div {...stylex.props(styles.swarmHeader)}>
        <span {...stylex.props(styles.caption)}>
          {behind.length === 0
            ? "Every install is on the newest revision."
            : `${behind.length} install${behind.length === 1 ? "" : "s"} behind, by ${axis === "revisions" ? "newer revisions" : "time since replaced"}`}
        </span>
        <ToggleGroup
          aria-label="Measure"
          value={[axis]}
          onValueChange={(value: string[]) => {
            if (value[0] === "revisions" || value[0] === "age") setAxis(value[0]);
          }}
        >
          <Toggle value="revisions" size="sm">
            Revisions
          </Toggle>
          <Toggle value="age" size="sm">
            Age
          </Toggle>
        </ToggleGroup>
      </div>
      <div ref={ref}>
        <svg
          role="group"
          aria-label="Installs behind the registry"
          width={width}
          height={HEIGHT}
          {...stylex.props(styles.svg)}
        >
          <line
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={HEIGHT - MARGIN.bottom}
            y2={HEIGHT - MARGIN.bottom}
            {...stylex.props(styles.axis)}
          />
          {ticks.map((tick) => (
            <g key={tick.label} transform={`translate(${tick.x},${HEIGHT - MARGIN.bottom})`}>
              <line y2={4} {...stylex.props(styles.axis)} />
              <text y={18} textAnchor="middle" {...stylex.props(styles.tick)}>
                {tick.label}
              </text>
            </g>
          ))}
          {dots.map(({ row, x, y }) => {
            const self = { kind: "project", id: row.project } as const;
            const label = `${row.item} in ${row.project}: ${row.revisionsBehind} revision${row.revisionsBehind === 1 ? "" : "s"} behind${row.state === "modified" ? ", modified" : ""}`;
            const tip = (target: Element) =>
              onTip({ anchor: target, content: <DotTip row={row} runner={runner} /> });
            return (
              <circle
                key={`${row.project}:${row.item}`}
                cx={x}
                cy={y}
                r={DOT}
                tabIndex={0}
                role="button"
                aria-label={label}
                onPointerEnter={(event) => {
                  onHover(self);
                  tip(event.currentTarget);
                }}
                onPointerLeave={() => {
                  onHover(null);
                  onTip(null);
                }}
                onFocus={(event) => {
                  onHover(self);
                  tip(event.currentTarget);
                }}
                onBlur={() => {
                  onHover(null);
                  onTip(null);
                }}
                onClick={() => onPin(sameFocus(pinned, self) ? null : self)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onPin(sameFocus(pinned, self) ? null : self);
                  }
                }}
                {...stylex.props(
                  styles.dot,
                  groupFill[groupIndex(namespaces, row.namespace)],
                  row.state === "modified" && styles.dotModified,
                  focus && !matches(row, focus) && styles.dimmed,
                )}
              />
            );
          })}
        </svg>
      </div>
      <ul aria-label="Namespaces" {...stylex.props(styles.legend)}>
        {namespaces.map((namespace) => (
          <li key={namespace} {...stylex.props(styles.legendItem)}>
            <span
              aria-hidden
              {...stylex.props(styles.swatch, groupFill[groupIndex(namespaces, namespace)])}
            />
            {namespace}
          </li>
        ))}
        <li {...stylex.props(styles.legendItem)}>
          <span aria-hidden {...stylex.props(styles.swatch, styles.swatchModified)} />
          modified
        </li>
      </ul>
    </div>
  );
}

function DotTip({ row, runner }: { row: Install; runner: string }) {
  const command = fixCommand(row, runner);
  return (
    <>
      <span>
        <strong>{row.item}</strong> in {row.project}
      </span>
      <span {...stylex.props(styles.tipMuted)}>
        {row.revisionsBehind} newer revision{row.revisionsBehind === 1 ? "" : "s"}
        {row.daysBehind !== null && `, replaced ${formatAge(row.daysBehind)} ago`}
        {row.state === "modified" && ", modified locally"}
      </span>
      {command && (
        <code {...stylex.props(styles.tipCode)}>
          {command} <span {...stylex.props(styles.tipMuted)}>in {row.path}</span>
        </code>
      )}
    </>
  );
}

const dynamic = stylex.create({
  width: (width: string) => ({ width }),
  grow: (grow: number) => ({ flexGrow: grow }),
});

const styles = stylex.create({
  bars: {
    gap: spacing["2"],
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
  },
  list: {
    margin: 0,
    padding: 0,
    gap: 2,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  bar: {
    borderRadius: radius.sm,
    borderWidth: 0,
    gap: spacing["3"],
    outline: "none",
    paddingBlock: spacing["1"],
    paddingInline: spacing["2"],
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":focus-visible": colors.muted,
      ":hover": colors.muted,
    },
    color: colors.foreground,
    cursor: "pointer",
    display: "grid",
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeSm,
    gridTemplateColumns: "7.5rem 1fr 2rem",
    textAlign: "start",
    transitionDuration: { default: motion.durationFast, [media.reducedMotion]: "0s" },
    transitionProperty: "opacity, background-color",
    width: "100%",
  },
  barMuted: {
    color: colors.mutedForeground,
  },
  barPinned: {
    backgroundColor: colors.muted,
    fontWeight: typography.fontWeightMedium,
  },
  barLabel: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  track: {
    display: "flex",
    transitionDuration: { default: motion.durationFast, [media.reducedMotion]: "0s" },
    transitionProperty: "opacity",
    height: spacing["2.5"],
  },
  fill: {
    borderRadius: radius.sm,
    gap: 1,
    overflow: "hidden",
    display: "flex",
  },
  segment: {
    minWidth: 2,
  },
  barCount: {
    color: colors.mutedForeground,
    fontVariantNumeric: "tabular-nums",
    textAlign: "end",
  },
  swarm: {
    gap: spacing["3"],
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  swarmHeader: {
    gap: spacing["3"],
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  caption: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
  },
  svg: {
    overflow: "visible",
    display: "block",
  },
  axis: {
    stroke: colors.border,
  },
  tick: {
    fill: colors.mutedForeground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
    fontVariantNumeric: "tabular-nums",
  },
  dot: {
    stroke: {
      default: colors.background,
      ":focus-visible": colors.foreground,
    },
    strokeWidth: 1.5,
    outline: "none",
    cursor: "pointer",
    transitionDuration: { default: motion.durationFast, [media.reducedMotion]: "0s" },
    transitionProperty: "opacity",
  },
  dotModified: {
    stroke: "oklch(0.62 0.16 320)",
    strokeWidth: 2.5,
  },
  dimmed: {
    opacity: 0.2,
  },
  legend: {
    margin: 0,
    padding: 0,
    gap: spacing["3"],
    listStyle: "none",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: typography.fontSizeXs,
  },
  legendItem: {
    gap: spacing["1.5"],
    alignItems: "center",
    display: "flex",
  },
  swatch: {
    borderRadius: radius.full,
    height: spacing["2"],
    width: spacing["2"],
  },
  swatchModified: {
    borderColor: "oklch(0.62 0.16 320)",
    borderStyle: "solid",
    borderWidth: 2,
    boxSizing: "border-box",
  },
  tipMuted: {
    color: colors.mutedForeground,
  },
  tipCode: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
  },
});
