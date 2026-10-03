import * as stylex from "@stylexjs/stylex";
import { colors } from "../../foundations/tokens.stylex";

/* Status and namespace colors are literals, private to this block, so changing the chart palette never changes what a status means. */

export const stateFill = stylex.create({
  current: { fill: "oklch(0.65 0.13 160)", backgroundColor: "oklch(0.65 0.13 160)" },
  behind: { fill: "oklch(0.7 0.15 60)", backgroundColor: "oklch(0.7 0.15 60)" },
  modified: { fill: "oklch(0.62 0.16 320)", backgroundColor: "oklch(0.62 0.16 320)" },
  unused: { fill: colors.mutedForeground, backgroundColor: colors.mutedForeground },
  package: { fill: colors.chart1, backgroundColor: colors.chart1 },
  other: { fill: colors.chart6, backgroundColor: colors.chart6 },
});

export const stateStroke = stylex.create({
  current: { stroke: "oklch(0.65 0.13 160)" },
  behind: { stroke: "oklch(0.7 0.15 60)" },
  modified: { stroke: "oklch(0.62 0.16 320)" },
  unused: { stroke: colors.mutedForeground },
  package: { stroke: colors.chart1 },
  other: { stroke: colors.chart6 },
});

const groups = stylex.create({
  fill0: { fill: "oklch(0.62 0.14 250)", backgroundColor: "oklch(0.62 0.14 250)" },
  fill1: { fill: "oklch(0.68 0.1 210)", backgroundColor: "oklch(0.68 0.1 210)" },
  fill2: { fill: "oklch(0.62 0.16 320)", backgroundColor: "oklch(0.62 0.16 320)" },
  fill3: { fill: "oklch(0.65 0.13 160)", backgroundColor: "oklch(0.65 0.13 160)" },
  fill4: { fill: "oklch(0.7 0.15 60)", backgroundColor: "oklch(0.7 0.15 60)" },
  fill5: { fill: "oklch(0.62 0.17 28)", backgroundColor: "oklch(0.62 0.17 28)" },
  stroke0: { stroke: "oklch(0.62 0.14 250)" },
  stroke1: { stroke: "oklch(0.68 0.1 210)" },
  stroke2: { stroke: "oklch(0.62 0.16 320)" },
  stroke3: { stroke: "oklch(0.65 0.13 160)" },
  stroke4: { stroke: "oklch(0.7 0.15 60)" },
  stroke5: { stroke: "oklch(0.62 0.17 28)" },
});

/** Namespace colors, assigned in sorted namespace order and repeated past six. */
export const groupFill = [
  groups.fill0,
  groups.fill1,
  groups.fill2,
  groups.fill3,
  groups.fill4,
  groups.fill5,
];

export const groupStroke = [
  groups.stroke0,
  groups.stroke1,
  groups.stroke2,
  groups.stroke3,
  groups.stroke4,
  groups.stroke5,
];

export function groupIndex(all: string[], group: string): number {
  return Math.max(0, all.indexOf(group)) % groupFill.length;
}
