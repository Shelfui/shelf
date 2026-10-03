import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { colors, spacing, typography } from "@/styles/shelf/tokens.stylex";
import { screens, site } from "@/styles/site.stylex";

export interface FeatureTile {
  title: string;
  text: string;
  art: ReactNode;
}

/** Square tiles, each an illustration over a title and one short sentence. */
export function FeatureTiles({ items }: { items: readonly FeatureTile[] }) {
  return (
    <ul {...stylex.props(styles.grid)}>
      {items.map((item) => (
        <li key={item.title} {...stylex.props(styles.tile)}>
          <div {...stylex.props(styles.art)}>{item.art}</div>
          <div {...stylex.props(styles.caption)}>
            <h2 {...stylex.props(styles.title)}>{item.title}</h2>
            <p {...stylex.props(styles.text)}>{item.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

const styles = stylex.create({
  grid: {
    gap: spacing["4"],
    display: "grid",
    gridTemplateColumns: {
      default: "1fr",
      [screens.md]: "repeat(2, minmax(0, 1fr))",
      [screens.xl]: "repeat(4, minmax(0, 1fr))",
    },
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  tile: {
    gap: site.space10,
    backgroundColor: colors.card,
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
    padding: { default: spacing["6"], [screens.md]: site.space12, [screens.xl]: site.space10 },
  },
  art: {
    alignItems: "center",
    aspectRatio: { default: "4 / 3", [screens.xl]: "1" },
    display: "flex",
    justifyContent: "center",
  },
  caption: {
    gap: spacing["2"],
    display: "flex",
    flexDirection: "column",
  },
  title: {
    margin: 0,
    fontSize: site.fontSize2xl,
    fontWeight: typography.fontWeightRegular,
    letterSpacing: "-0.01em",
    lineHeight: 1.375,
  },
  text: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: {
      default: typography.fontSizeLg,
      [screens.md]: site.fontSizeXl,
      [screens.xl]: typography.fontSizeLg,
    },
    lineHeight: 1.375,
    maxWidth: "30rem",
    textWrap: "pretty",
  },
});
