import * as stylex from "@stylexjs/stylex";
import { CheckIcon } from "lucide-react";
import type { ReactNode } from "react";
import { media } from "@/styles/shelf/conditions.stylex";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";

/** A small, static picture of a Shelf moment, drawn on a tile. */
function Panel({ children }: { children: ReactNode }) {
  return <div {...stylex.props(styles.panel)}>{children}</div>;
}

function Row({ start, end }: { start: ReactNode; end: ReactNode }) {
  return (
    <div {...stylex.props(styles.row)}>
      <span>{start}</span>
      <span {...stylex.props(styles.quiet)}>{end}</span>
    </div>
  );
}

export function AddMock() {
  return (
    <Panel>
      <Row start={<code {...stylex.props(styles.mono)}>shelf add button</code>} end="2 files" />
      <div {...stylex.props(styles.track)}>
        <div {...stylex.props(styles.fill)} />
      </div>
    </Panel>
  );
}

export function ChangeMock() {
  return (
    <Panel>
      <Row start="button.tsx" end="Yours" />
      <div {...stylex.props(styles.button)}>Save changes</div>
    </Panel>
  );
}

export function StatusMock() {
  return (
    <Panel>
      <div {...stylex.props(styles.table)}>
        <span {...stylex.props(styles.quiet)}>File</span>
        <span {...stylex.props(styles.quiet, styles.end)}>Status</span>
        <span>button.tsx</span>
        <span {...stylex.props(styles.end)}>Modified</span>
        <span>dialog.tsx</span>
        <span {...stylex.props(styles.quiet, styles.end)}>Unchanged</span>
      </div>
    </Panel>
  );
}

const CHECKS = ["Config", "Provenance", "Dependencies", "Imports"];

export function CheckMock() {
  return (
    <Panel>
      <ul {...stylex.props(styles.checks)}>
        {CHECKS.map((check, index) => (
          <li key={check} {...stylex.props(styles.check)}>
            <span {...stylex.props(styles.tick, styles.blink, ticks[index])}>
              <CheckIcon />
            </span>
            {check}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

const grow = stylex.keyframes({
  "0%": { transform: "scaleX(0)" },
  "60%, 100%": { transform: "scaleX(1)" },
});

const round = stylex.keyframes({
  "0%, 35%": { borderRadius: 0 },
  "50%, 85%": { borderRadius: "999px" },
  "100%": { borderRadius: 0 },
});

const appear = stylex.keyframes({
  "0%": { opacity: 0.15 },
  "10%, 85%": { opacity: 1 },
  "100%": { opacity: 0.15 },
});

const styles = stylex.create({
  panel: {
    gap: spacing["4"],
    backgroundColor: colors.muted,
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
    fontSize: typography.fontSizeSm,
    maxWidth: "100%",
    padding: spacing["6"],
    width: "17rem",
  },
  row: {
    gap: spacing["4"],
    alignItems: "baseline",
    display: "flex",
    justifyContent: "space-between",
  },
  quiet: {
    color: colors.mutedForeground,
  },
  mono: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeSm,
  },
  track: {
    backgroundColor: colors.border,
    height: "2px",
    overflow: "hidden",
  },
  fill: {
    animationDuration: "3s",
    animationIterationCount: "infinite",
    animationName: { default: grow, [media.reducedMotion]: "none" },
    animationTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
    backgroundColor: colors.foreground,
    height: "100%",
    transformOrigin: "left",
  },
  button: {
    alignItems: "center",
    animationDuration: "5s",
    animationIterationCount: "infinite",
    animationName: { default: round, [media.reducedMotion]: "none" },
    animationTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
    display: "flex",
    height: "2.25rem",
    justifyContent: "center",
  },
  table: {
    columnGap: spacing["4"],
    display: "grid",
    gridTemplateColumns: "1fr auto",
    rowGap: spacing["3"],
  },
  end: {
    textAlign: "end",
  },
  checks: {
    gap: spacing["3"],
    display: "flex",
    flexDirection: "column",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  check: {
    gap: spacing["3"],
    alignItems: "center",
    display: "flex",
  },
  tick: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: "999px",
    display: "inline-flex",
    flexShrink: 0,
    fontSize: "0.75rem",
    height: "1.25rem",
    justifyContent: "center",
    width: "1.25rem",
  },
  blink: {
    animationDuration: "4s",
    animationIterationCount: "infinite",
    animationName: { default: appear, [media.reducedMotion]: "none" },
  },
});

const stagger = stylex.create({
  t0: { animationDelay: "0s" },
  t1: { animationDelay: "0.4s" },
  t2: { animationDelay: "0.8s" },
  t3: { animationDelay: "1.2s" },
});

const ticks = [stagger.t0, stagger.t1, stagger.t2, stagger.t3];
