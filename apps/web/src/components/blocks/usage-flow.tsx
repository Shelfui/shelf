"use client";

import * as stylex from "@stylexjs/stylex";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { useMemo } from "react";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, motion, typography } from "@/styles/shelf/tokens.stylex";
import type { ChartProps } from "./usage-drift";
import { type FlowLink, type FlowNode, REGISTRY_NODE, flowGraph, sameFocus } from "./usage-model";
import { groupFill, groupIndex, groupStroke } from "./usage-palette";
import { useWidth } from "./usage-size";

const NODE_WIDTH = 10;
const ROW = 34;
const MIN_WIDTH = 300;

/** d3-sankey replaces link ends with their nodes. */
const nodeId = (node: string | number | FlowNode) =>
  typeof node === "object" ? node.id : String(node);

/**
 * Items flow from the registry into the projects that install them, and on through shared
 * packages into the apps that import those. Width is the number of items.
 */
export function Flow({ rows, namespaces, focus, pinned, onHover, onPin, onTip }: ChartProps) {
  const [ref, width] = useWidth<HTMLDivElement>(720);
  const graph = useMemo(() => flowGraph(rows), [rows]);
  const namespaceOf = new Map(rows.map((row) => [row.project, row.namespace]));
  const projects = graph.nodes.filter((node) => node.kind === "project").length;
  const height = Math.max(200, projects * ROW);

  const layout = useMemo(() => {
    if (graph.links.length === 0) return null;
    return sankey<FlowNode, FlowLink>()
      .nodeId((node) => node.id)
      .nodeWidth(NODE_WIDTH)
      .nodePadding(14)
      .nodeSort((a, b) => a.id.localeCompare(b.id))
      .extent([
        [1, 8],
        [Math.max(MIN_WIDTH, width - 1), height - 8],
      ])({
      nodes: graph.nodes.map((node) => ({ ...node })),
      links: graph.links.map((link) => ({ ...link })),
    });
  }, [graph, width, height]);

  if (!layout) {
    return <p {...stylex.props(styles.empty)}>No installs match.</p>;
  }

  const focusProject = focus?.kind === "project" ? focus.id : null;
  const focusItem = focus?.kind === "item" ? focus.id : null;
  const litLink = (link: FlowLink) =>
    focus === null ||
    (focusItem !== null && link.items.includes(focusItem)) ||
    (focusProject !== null &&
      (nodeId(link.source) === focusProject || nodeId(link.target) === focusProject));

  return (
    <div ref={ref} {...stylex.props(styles.root)}>
      <svg
        role="group"
        aria-label={`Items flowing from the registry into ${projects} projects`}
        width={width}
        height={height}
        {...stylex.props(styles.svg)}
      >
        <g fill="none">
          {layout.links.map((link) => {
            const target = nodeId(link.target);
            const source = nodeId(link.source);
            const viaPackage = source !== REGISTRY_NODE;
            const color = groupStroke[groupIndex(namespaces, namespaceOf.get(target) ?? "")];
            const content = (
              <>
                <span>
                  <strong>{link.value}</strong> item{link.value === 1 ? "" : "s"}{" "}
                  {viaPackage ? `from ${source}` : "from the registry"} into {target}
                </span>
                <span {...stylex.props(styles.tipMuted)}>
                  {link.items.slice(0, 8).join(", ")}
                  {link.items.length > 8 && `, and ${link.items.length - 8} more`}
                </span>
              </>
            );
            return (
              <path
                key={`${source}>${target}`}
                d={sankeyLinkHorizontal()(link) ?? undefined}
                onPointerEnter={(event) => {
                  onHover({ kind: "project", id: target });
                  onTip({ anchor: event.currentTarget, content });
                }}
                onPointerLeave={() => {
                  onHover(null);
                  onTip(null);
                }}
                {...stylex.props(
                  styles.link,
                  dynamic.width(Math.max(1, link.width ?? 1)),
                  color,
                  viaPackage && styles.linkPackage,
                  !litLink(link) && styles.linkDim,
                )}
              />
            );
          })}
        </g>
        {layout.nodes.map((node) => {
          const x0 = node.x0 ?? 0;
          const x1 = node.x1 ?? 0;
          const y0 = node.y0 ?? 0;
          const y1 = node.y1 ?? 0;
          const registry = node.kind === "registry";
          const self = registry ? null : ({ kind: "project", id: node.id } as const);
          const lit =
            focus === null ||
            registry ||
            node.id === focusProject ||
            layout.links.some(
              (link) =>
                litLink(link) &&
                (nodeId(link.source) === node.id || nodeId(link.target) === node.id),
            );
          const leftLabel = x0 > width / 2;
          const namespace = namespaceOf.get(node.id) ?? "";
          return (
            <g
              key={node.id}
              tabIndex={self ? 0 : undefined}
              role={self ? "button" : undefined}
              aria-label={self ? `${node.id}: ${node.value ?? 0} items` : undefined}
              aria-pressed={self ? sameFocus(pinned, self) : undefined}
              onPointerEnter={() => self && onHover(self)}
              onPointerLeave={() => self && onHover(null)}
              onFocus={() => self && onHover(self)}
              onBlur={() => self && onHover(null)}
              onClick={() => self && onPin(sameFocus(pinned, self) ? null : self)}
              onKeyDown={(event) => {
                if (self && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  onPin(sameFocus(pinned, self) ? null : self);
                }
              }}
              {...stylex.props(styles.node, !lit && styles.nodeDim)}
            >
              <rect
                x={x0}
                y={y0}
                width={x1 - x0}
                height={Math.max(2, y1 - y0)}
                rx={2}
                {...stylex.props(
                  registry ? styles.registryNode : groupFill[groupIndex(namespaces, namespace)],
                )}
              />
              <text
                x={leftLabel ? x0 - 8 : x1 + 8}
                y={(y0 + y1) / 2}
                dy="0.32em"
                textAnchor={leftLabel ? "end" : "start"}
                {...stylex.props(styles.label, registry && styles.registryLabel)}
              >
                {node.label}
                <tspan {...stylex.props(styles.count)}> {node.value}</tspan>
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const dynamic = stylex.create({
  width: (strokeWidth: number) => ({ strokeWidth }),
});

const styles = stylex.create({
  root: {
    minWidth: 0,
  },
  svg: {
    overflow: "visible",
    display: "block",
  },
  empty: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
  },
  link: {
    strokeOpacity: 0.35,
    transitionDuration: { default: motion.durationFast, [media.reducedMotion]: "0s" },
    transitionProperty: "stroke-opacity",
  },
  linkPackage: {
    strokeOpacity: 0.55,
  },
  linkDim: {
    strokeOpacity: 0.06,
  },
  node: {
    outline: "none",
    cursor: "pointer",
    transitionDuration: { default: motion.durationFast, [media.reducedMotion]: "0s" },
    transitionProperty: "opacity",
  },
  nodeDim: {
    opacity: 0.3,
  },
  registryNode: {
    fill: colors.foreground,
  },
  label: {
    fill: colors.foreground,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSizeXs,
  },
  registryLabel: {
    fontWeight: typography.fontWeightMedium,
  },
  count: {
    fill: colors.mutedForeground,
    fontVariantNumeric: "tabular-nums",
  },
  tipMuted: {
    color: colors.mutedForeground,
  },
});
