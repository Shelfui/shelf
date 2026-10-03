import * as stylex from "@stylexjs/stylex";
import { colors } from "../../foundations/tokens.stylex";

export const stateFill = stylex.create({
  current: { fill: colors.chart4, backgroundColor: colors.chart4 },
  behind: { fill: colors.chart2, backgroundColor: colors.chart2 },
  modified: { fill: colors.chart3, backgroundColor: colors.chart3 },
  unused: { fill: colors.mutedForeground, backgroundColor: colors.mutedForeground },
  package: { fill: colors.chart1, backgroundColor: colors.chart1 },
  other: { fill: colors.chart6, backgroundColor: colors.chart6 },
});

export const stateStroke = stylex.create({
  current: { stroke: colors.chart4 },
  behind: { stroke: colors.chart2 },
  modified: { stroke: colors.chart3 },
  unused: { stroke: colors.mutedForeground },
  package: { stroke: colors.chart1 },
  other: { stroke: colors.chart6 },
});

const groups = stylex.create({
  fill0: { fill: colors.chart1, backgroundColor: colors.chart1 },
  fill1: { fill: colors.chart5, backgroundColor: colors.chart5 },
  fill2: { fill: colors.chart3, backgroundColor: colors.chart3 },
  fill3: { fill: colors.chart4, backgroundColor: colors.chart4 },
  fill4: { fill: colors.chart2, backgroundColor: colors.chart2 },
  fill5: { fill: colors.chart6, backgroundColor: colors.chart6 },
  stroke0: { stroke: colors.chart1 },
  stroke1: { stroke: colors.chart5 },
  stroke2: { stroke: colors.chart3 },
  stroke3: { stroke: colors.chart4 },
  stroke4: { stroke: colors.chart2 },
  stroke5: { stroke: colors.chart6 },
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
