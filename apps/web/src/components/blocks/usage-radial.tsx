"use client";

import * as stylex from "@stylexjs/stylex";
import { curveBundle, lineRadial } from "d3-shape";
import { useMemo } from "react";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, motion, typography } from "@/styles/shelf/tokens.stylex";
import type { ChartProps } from "./usage-drift";
import { type Focus, type RadialNode, STATE_LABELS, radialLayout, sameFocus } from "./usage-model";
import { groupFill, groupIndex, stateStroke } from "./usage-palette";
import { useWidth } from "./usage-size";

const LABEL_SPACE = 120;
const MAX_SIZE = 760;

const line = lineRadial<[number, number]>()
  .angle((point) => point[0])
  .radius((point) => point[1])
  .curve(curveBundle.beta(0.85));

/**
 * Projects around the left half, items around the right, one bundled line per install. Lines
 * meet in the middle, so shared items and busy namespaces read as thick strands.
 */
export function Radial({ rows, namespaces, focus, pinned, onHover, onPin, onTip }: ChartProps) {
  const [ref, width] = useWidth<HTMLDivElement>(MAX_SIZE);
  const size = Math.min(width, MAX_SIZE);
  const radius = Math.max(80, size / 2 - LABEL_SPACE);
  const { nodes, links } = useMemo(() => radialLayout(rows, radius), [rows, radius]);

  const active = (node: RadialNode) =>
    !focus ||
    (focus.kind === node.kind && focus.id === node.label) ||
    links.some(
      (link) =>
        (link.source === node.id || link.target === node.id) &&
        (link.source === `${focus.kind}:${focus.id}` ||
          link.target === `${focus.kind}:${focus.id}`),
    );
  const focusId = focus && `${focus.kind}:${focus.id}`;

  return (
    <div ref={ref} {...stylex.props(styles.root)}>
      <svg
        role="group"
        aria-label={`${nodes.filter((n) => n.kind === "project").length} projects and ${nodes.filter((n) => n.kind === "item").length} items, linked by ${links.length} installs`}
        width={size}
        height={size}
        viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
        {...stylex.props(styles.svg)}
      >
        <g fill="none">
          {links.map((link) => {
            const lit = focusId !== null && (link.source === focusId || link.target === focusId);
            return (
              <path
                key={`${link.source}>${link.target}`}
                d={line(link.points) ?? undefined}
                {...stylex.props(
                  styles.link,
                  stateStroke[link.state],
                  link.state === "package" && styles.dashed,
                  focusId !== null && (lit ? styles.linkLit : styles.linkDim),
                )}
              />
            );
          })}
        </g>
        {nodes.map((node) => {
          const self: Focus = { kind: node.kind, id: node.label };
          const degrees = (node.angle * 180) / Math.PI - 90;
          const flip = node.angle > Math.PI;
          const count = links.filter(
            (link) => link.source === node.id || link.target === node.id,
          ).length;
          const label =
            node.kind === "project"
              ? `${node.label}, ${node.group}: ${count} items`
              : `${node.label}, ${node.group}: in ${count} project${count === 1 ? "" : "s"}`;
          const summary = (
            <>
              <strong>{node.label}</strong>
              <span {...stylex.props(styles.tipMuted)}>
                {node.kind === "project"
                  ? `${count} item${count === 1 ? "" : "s"} · ${node.group}`
                  : `${count} project${count === 1 ? "" : "s"} · ${node.group}`}
              </span>
              <span {...stylex.props(styles.tipMuted)}>
                {Object.entries(
                  links
                    .filter((link) => link.source === node.id || link.target === node.id)
                    .reduce<Record<string, number>>((counts, link) => {
                      counts[STATE_LABELS[link.state]] =
                        (counts[STATE_LABELS[link.state]] ?? 0) + 1;
                      return counts;
                    }, {}),
                )
                  .map(([state, n]) => `${n} ${state.toLowerCase()}`)
                  .join(", ")}
              </span>
            </>
          );
          return (
            <g
              key={node.id}
              transform={`rotate(${degrees}) translate(${radius + 4},0)`}
              tabIndex={0}
              role="button"
              aria-label={label}
              aria-pressed={sameFocus(pinned, self)}
              onPointerEnter={(event) => {
                onHover(self);
                onTip({ anchor: event.currentTarget, content: summary });
              }}
              onPointerLeave={() => {
                onHover(null);
                onTip(null);
              }}
              onFocus={(event) => {
                onHover(self);
                onTip({ anchor: event.currentTarget, content: summary });
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
                stylex.defaultMarker(),
                styles.node,
                !active(node) && styles.nodeDim,
              )}
            >
              <circle
                r={node.kind === "project" ? 4 : 2.5}
                {...stylex.props(
                  node.kind === "project"
                    ? groupFill[groupIndex(namespaces, node.group)]
                    : styles.itemDot,
                )}
              />
              <text
                x={flip ? -8 : 8}
                dy="0.32em"
                textAnchor={flip ? "end" : "start"}
                transform={flip ? "rotate(180)" : undefined}
                {...stylex.props(
                  styles.label,
                  node.kind === "project" && styles.projectLabel,
                  sameFocus(pinned, self) && styles.labelPinned,
                )}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const styles = stylex.create({
  root: {
    display: "flex",
    justifyContent: "center",
    minWidth: 0,
  },
  svg: {
    overflow: "visible",
    display: "block",
  },
  link: {
    strokeOpacity: 0.45,
    strokeWidth: 1.25,
    mixBlendMode: "normal",
    transitionDuration: { default: motion.durationFast, [media.reducedMotion]: "0s" },
    transitionProperty: "stroke-opacity, stroke-width",
  },
  dashed: {
    strokeDasharray: "3 3",
  },
  linkLit: {
    strokeOpacity: 0.95,
    strokeWidth: 2,
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
    opacity: 0.25,
  },
  itemDot: {
    fill: colors.mutedForeground,
  },
  label: {
    fill: {
      default: colors.mutedForeground,
      [stylex.when.ancestor(":focus-visible")]: colors.foreground,
      [stylex.when.ancestor(":hover")]: colors.foreground,
    },
    textDecoration: {
      default: "none",
      [stylex.when.ancestor(":focus-visible")]: "underline",
    },
    fontFamily: typography.fontFamily,
    fontSize: 11,
  },
  projectLabel: {
    fill: colors.foreground,
    fontWeight: typography.fontWeightMedium,
  },
  labelPinned: {
    fill: colors.foreground,
    fontWeight: typography.fontWeightSemibold,
  },
  tipMuted: {
    color: colors.mutedForeground,
  },
});
