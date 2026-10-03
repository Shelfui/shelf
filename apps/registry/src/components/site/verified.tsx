import * as stylex from "@stylexjs/stylex";
import { CheckIcon } from "@/components/ui/icons";
import type { Verification, Weight } from "@/data";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { text } from "./styles";

/** Gzipped bytes as kB, with one decimal under 10 kB. */
export function formatSize(bytes: number): string {
  const kilobytes = bytes / 1000;
  return `${kilobytes < 10 ? kilobytes.toFixed(1) : Math.round(kilobytes)} kB`;
}

export const weigh = (weight: Weight) => weight.js + weight.css;

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * What `bun run verify` measured for the item. A check that did not pass is left out, so
 * everything listed is something the registry actually proved.
 */
export function Verified({ verification }: { verification: Verification }) {
  const { size, stories, compiler, doctor } = verification;
  const checks: string[] = [];
  if (stories.total > 0) {
    checks.push(`Axe passes on ${count(stories.total, "story", "stories")}`);
  }
  if (stories.interactive > 0) {
    checks.push(
      `${count(stories.interactive, "interaction test", "interaction tests")} in Storybook`,
    );
  }
  if (verification.renderTested) {
    checks.push("Parent re-renders skip its consumers");
  }
  if (compiler && compiler.failed === 0) {
    checks.push("Compiles with React Compiler");
  }
  if (doctor.errors + doctor.warnings === 0) {
    checks.push("React Doctor finds nothing");
  }

  return (
    <div {...stylex.props(styles.root)}>
      <dl {...stylex.props(styles.sizes)}>
        <div {...stylex.props(styles.size)}>
          <dt {...stylex.props(text.muted)}>This item</dt>
          <dd {...stylex.props(styles.figure)}>{formatSize(weigh(size.own))}</dd>
        </div>
        <div {...stylex.props(styles.size)}>
          <dt {...stylex.props(text.muted)}>With dependencies</dt>
          <dd {...stylex.props(styles.figure)}>{formatSize(weigh(size.total))}</dd>
        </div>
      </dl>
      <p {...stylex.props(styles.note)}>Gzipped JS and CSS in a production build, without React.</p>
      {checks.length > 0 && (
        <ul {...stylex.props(styles.checks)}>
          {checks.map((check) => (
            <li key={check} {...stylex.props(styles.check)}>
              <span aria-hidden {...stylex.props(styles.tick)}>
                <CheckIcon />
              </span>
              {check}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["3"],
  },
  sizes: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["2"],
    margin: 0,
  },
  size: {
    alignItems: "baseline",
    display: "flex",
    gap: spacing["2"],
    justifyContent: "space-between",
  },
  figure: {
    color: colors.foreground,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeSm,
    fontVariantNumeric: "tabular-nums",
    margin: 0,
  },
  note: {
    color: colors.mutedForeground,
    fontSize: typography.fontSizeXs,
    margin: 0,
  },
  checks: {
    display: "flex",
    flexDirection: "column",
    gap: spacing["2"],
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  check: {
    alignItems: "flex-start",
    color: colors.foreground,
    display: "flex",
    fontSize: typography.fontSizeSm,
    gap: spacing["2"],
  },
  tick: {
    color: colors.mutedForeground,
    display: "flex",
    flexShrink: 0,
    paddingTop: spacing["1"],
  },
});
